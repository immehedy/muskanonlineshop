import { OrderDatabase } from "@/lib/order";
import { Order } from "@/types/checkout";
import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.CARRY_BEE_BASE_URL;

const DELIVERY_TYPE_NORMAL = 1; // Normal
const PRODUCT_TYPE_PARCEL = 1; // Parcel

function carryBeeHeaders() {
  return {
    "Content-Type": "application/json",
    "Client-ID": process.env.CARRY_BEE_CLIENT_ID!,
    "Client-Secret": process.env.CARRY_BEE_CLIENT_SECRET!,
    "Client-Context": process.env.CARRY_BEE_CLIENT_CONTEXT!,
  };
}

type AddressDetailsResponse = {
  error: boolean;
  message: string;
  data?: {
    city_id: number;
    zone_id: number;
  };
};

type CarryBeeCreateOrderResponse = {
  error: boolean;
  message: string;
  data?: {
    order?: {
      consignment_id?: string;
      store_id?: string;
      merchant_order_id?: string;
      collectable_amount?: string;
      cod_fee?: number;
      delivery_fee?: string;
    };
  };
};

export async function POST(req: NextRequest) {
  try {
    /**
     * Expected request body:
     * {
     *   orderId: "mongo_order_id",   // ✅ strongly recommended
     *   order: Order,
     *   item_weight?: number         // optional (defaults to 500)
     * }
     */
    const bodyData = await req.json();

    const order: Order = bodyData.order;
    const orderId: string | undefined =
      bodyData.orderId || (order as any)?._id || (order as any)?.id;

    // ✅ dynamic item weight with default 500
    const itemWeight =
      typeof bodyData.item_weight === "number" && bodyData.item_weight > 0
        ? bodyData.item_weight
        : 500;

    if (!BASE) {
      return NextResponse.json(
        { error: "Missing CARRY_BEE_BASE_URL" },
        { status: 500 }
      );
    }

    if (!order || !order.orderNumber || !order.shippingAddress || !order.items) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    // If you want DB update, you need an id
    if (!orderId) {
      return NextResponse.json(
        {
          error:
            "Missing orderId. Send { orderId, order } so we can save consignmentId after dispatch.",
        },
        { status: 400 }
      );
    }

    const headers = carryBeeHeaders();

    // 1) Build address query string
    const addr = order.shippingAddress;
    const addressQuery = [addr.address, addr.city, addr.zipCode, addr.country]
      .filter(Boolean)
      .join(", ");

    if (!addressQuery.trim()) {
      return NextResponse.json(
        { error: "Shipping address is empty" },
        { status: 400 }
      );
    }

    // 2) Resolve city_id + zone_id from CarryBee address-details
    const addressDetailsRes = await fetch(`${BASE}/api/v2/address-details`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: addressQuery }),
      cache: "no-store",
    });

    const addressDetailsData =
      (await addressDetailsRes.json().catch(() => null)) as
        | AddressDetailsResponse
        | null;

    if (!addressDetailsRes.ok || !addressDetailsData || addressDetailsData.error) {
      return NextResponse.json(
        {
          error: "Failed to resolve CarryBee address details",
          details: addressDetailsData ?? null,
        },
        { status: addressDetailsRes.status || 500 }
      );
    }

    const city_id = addressDetailsData.data?.city_id;
    const zone_id = addressDetailsData.data?.zone_id;

    if (!city_id || !zone_id) {
      return NextResponse.json(
        {
          error: "CarryBee did not return city_id/zone_id",
          details: addressDetailsData,
        },
        { status: 400 }
      );
    }

    // area_id not returned in your sample response → fallback
    const areaFallbackRaw = process.env.CARRY_BEE_AREA_ID_FALLBACK;
    const area_id =
      areaFallbackRaw !== undefined && areaFallbackRaw !== ""
        ? Number(areaFallbackRaw)
        : 0; // change to null if CarryBee expects null

    // 3) Create CarryBee order
    const payload = {
      store_id: process.env.CARRY_BEE_STORE_ID!,
      merchant_order_id: String(order.orderNumber),

      delivery_type: DELIVERY_TYPE_NORMAL,
      product_type: PRODUCT_TYPE_PARCEL,

      recipient_phone: addr.phone,
      recipient_secendary_phone: (addr as any).altPhone ?? null, // keep docs spelling
      recipient_name: `${addr.firstName} ${addr.lastName}`.trim(),
      recipient_address: addressQuery,

      city_id,
      zone_id,
      area_id,

      special_instruction: (order as any).note ?? null,
      product_description: order.items
        .map((item) => item.name || (item as any).title || "Unknown Item")
        .join(", "),

      item_weight: itemWeight, // ✅ dynamic
      item_quantity: Number(order.items.length),
      collectable_amount: Number(order.total),
      is_closed: false,
    };

    const createOrderRes = await fetch(`${BASE}/api/v2/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const createOrderData =
      (await createOrderRes.json().catch(() => null)) as
        | CarryBeeCreateOrderResponse
        | null;

    if (!createOrderRes.ok || !createOrderData) {
      return NextResponse.json(
        { error: createOrderData ?? "CarryBee order create failed" },
        { status: createOrderRes.status || 500 }
      );
    }

    if (createOrderData.error) {
      return NextResponse.json({ error: createOrderData }, { status: 400 });
    }

    const consignmentId = createOrderData.data?.order?.consignment_id;

    // 4) Update your Mongo order record with consignmentId using your existing DB layer
    //    (same approach as your PUT route)
    let updatedOrder: any = null;
    if (consignmentId) {
      updatedOrder = await OrderDatabase.updateOrder(orderId, {
        deliveryProvider: "carrybee",
        consignmentId,
      });
    }

    return NextResponse.json({
      success: true,
      consignmentId: consignmentId ?? null,
      updatedOrder: updatedOrder ?? null,
      addressDetails: { city_id, zone_id, area_id, addressQuery },
      carrybeePayload: payload, // remove in production if you want
      data: createOrderData,
    });
  } catch (error) {
    console.error("CarryBee dispatch order error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch order" },
      { status: 500 }
    );
  }
}
