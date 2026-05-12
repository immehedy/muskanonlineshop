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

type CarryBeeCancelResponse = {
  error: boolean;
  message: string;
};

export async function POST(req: NextRequest) {
  try {
    /**
     * Create order (dispatch)
     * Expected body:
     * {
     *   orderId: "mongo_order_id",
     *   order: Order,
     *   item_weight?: number
     * }
     */
    const bodyData = await req.json();

    const order: Order = bodyData.order;
    const orderId: string | undefined =
      bodyData.orderId || (order as any)?._id || (order as any)?.id;

    const itemWeight =
      typeof bodyData.item_weight === "number" && bodyData.item_weight > 0
        ? bodyData.item_weight
        : 500;

    if (!BASE) {
      return NextResponse.json({ error: "Missing CARRY_BEE_BASE_URL" }, { status: 500 });
    }

    if (!order || !order.orderNumber || !order.shippingAddress || !order.items) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId. Send { orderId, order } so we can save consignmentId." },
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
      return NextResponse.json({ error: "Shipping address is empty" }, { status: 400 });
    }

    // 2) Resolve city_id + zone_id
    const addressDetailsRes = await fetch(`${BASE}/api/v2/address-details`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: addressQuery }),
      cache: "no-store",
    });

    const addressDetailsData =
      (await addressDetailsRes.json().catch(() => null)) as AddressDetailsResponse | null;

    if (!addressDetailsRes.ok || !addressDetailsData || addressDetailsData.error) {
      return NextResponse.json(
        { error: "Failed to resolve CarryBee address details", details: addressDetailsData ?? null },
        { status: addressDetailsRes.status || 500 }
      );
    }

    const city_id = addressDetailsData.data?.city_id;
    const zone_id = addressDetailsData.data?.zone_id;

    if (!city_id || !zone_id) {
      return NextResponse.json(
        { error: "CarryBee did not return city_id/zone_id", details: addressDetailsData },
        { status: 400 }
      );
    }

    // area fallback
    const areaFallbackRaw = process.env.CARRY_BEE_AREA_ID_FALLBACK;
    const area_id =
      areaFallbackRaw !== undefined && areaFallbackRaw !== ""
        ? Number(areaFallbackRaw)
        : 0;

    // 3) Create CarryBee order
    const payload = {
      store_id: process.env.CARRY_BEE_STORE_ID!,
      merchant_order_id: String(order.orderNumber),

      delivery_type: DELIVERY_TYPE_NORMAL,
      product_type: PRODUCT_TYPE_PARCEL,

      recipient_phone: addr.phone,
      recipient_secendary_phone: (addr as any).altPhone ?? null,
      recipient_name: `${addr.firstName} ${addr.lastName}`.trim(),
      recipient_address: addressQuery,

      city_id,
      zone_id,
      area_id,

      special_instruction: (order as any).note ?? null,
      product_description: order.items
        .map((item) => item.name || (item as any).title || "Unknown Item")
        .join(", "),

      item_weight: itemWeight,
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
      (await createOrderRes.json().catch(() => null)) as CarryBeeCreateOrderResponse | null;

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

    // 4) Save consignmentId to DB
    if (consignmentId) {
      await OrderDatabase.updateOrder(orderId, {
        deliveryProvider: "carrybee",
        consignmentId,
      });
    }

    return NextResponse.json({
      success: true,
      consignmentId: consignmentId ?? null,
      addressDetails: { city_id, zone_id, area_id, addressQuery },
      data: createOrderData,
    });
  } catch (error) {
    console.error("CarryBee dispatch order error:", error);
    return NextResponse.json({ error: "Failed to dispatch order" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    /**
     * Cancel CarryBee order
     * Expected body:
     * {
     *   orderId: "mongo_order_id",
     *   cancellation_reason?: string
     * }
     *
     * We will load consignmentId from local DB (since you store it already).
     */
    const body = await req.json().catch(() => ({}));
    const orderId: string | undefined = body?.orderId;

    if (!BASE) {
      return NextResponse.json({ error: "Missing CARRY_BEE_BASE_URL" }, { status: 500 });
    }

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const cancellation_reason: string =
      typeof body?.cancellation_reason === "string" && body.cancellation_reason.trim()
        ? body.cancellation_reason.trim()
        : "Cancelled by admin";

    // 1) Load order from DB to get consignmentId
    const existing = await OrderDatabase.getOrder(orderId);
    
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const consignmentId: string | undefined =
      (existing as any).consignmentId || (existing as any)?.shipping?.courier?.consignmentId;

    if (!consignmentId) {
      return NextResponse.json(
        { error: "No consignmentId found in local DB for this order" },
        { status: 400 }
      );
    }

    // 2) Call CarryBee cancel endpoint
    const headers = carryBeeHeaders();

    const cancelRes = await fetch(
      `${BASE}/api/v2/orders/${encodeURIComponent(consignmentId)}/cancel`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ cancellation_reason }),
        cache: "no-store",
      }
    );

    const cancelData =
      (await cancelRes.json().catch(() => null)) as CarryBeeCancelResponse | null;

    // CarryBee can return 200 with error:true, so handle both.
    if (!cancelRes.ok || !cancelData) {
      return NextResponse.json(
        { error: cancelData ?? "CarryBee cancel failed" },
        { status: cancelRes.status || 500 }
      );
    }

    if (cancelData.error) {
      return NextResponse.json({ error: cancelData }, { status: 400 });
    }

    // 3) Update local order status (optional but recommended)
    const updatedOrder = await OrderDatabase.updateOrder(orderId, {
      status: "cancelled",
    });

    return NextResponse.json({
      success: true,
      message: cancelData.message,
      consignmentId,
      updatedOrder: updatedOrder ?? null,
    });
  } catch (error) {
    console.error("CarryBee cancel error:", error);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
