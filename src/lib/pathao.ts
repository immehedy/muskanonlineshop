import axios, { AxiosResponse } from 'axios';

interface PathaoTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface PathaoStoreData {
  name: string;
  contact_name: string;
  contact_number: string;
  address: string;
  city_id: number;
  zone_id: number;
}

interface PathaoOrderData {
    store_id: string; // Required and should always be a valid string
    merchant_order_id: string; // Your internal order reference
    sender_name: string;
    sender_phone: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    recipient_city: number; // ✅ Updated: Pathao expects numeric city_id
    recipient_zone: number; // ✅ Updated: Pathao expects numeric zone_id
    delivery_type: number; // e.g., 48 = 48-hour delivery
    item_type: number; // e.g., 2 = general items
    special_instruction?: string;
    item_quantity: number;
    item_weight: number; // in kilograms
    amount_to_collect: number; // applicable for COD
    item_description: string;
  }
  

interface PathaoOrderResponse {
  success: boolean;
  message: string;
  data: {
    consignment_id: string;
    order_status: string;
    delivery_fee: number;
    invoice_id?: string;
  };
}

interface PathaoOrderInfoResponse {
  success: boolean;
  message: string;
  data: {
    consignment_id: string;
    order_status: string;
    delivery_fee: number;
    invoice_id?: string;
    merchant_order_id: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    pickup_date?: string;
    delivery_date?: string;
    created_at: string;
    updated_at: string;
  };
}

interface PathaoCity {
  city_id: number;
  city_name: string;
}

interface PathaoZone {
  zone_id: number;
  zone_name: string;
  city_id: number;
}

class PathaoAPI {
  private baseURL: string;
  private clientId: string;
  private clientSecret: string;
  private username: string;
  private password: string;

  constructor() {
    this.baseURL = process.env.PATHAO_BASE_URL || 'https://courier-api-sandbox.pathao.com';
    this.clientId = process.env.PATHAO_CLIENT_ID || '';
    this.clientSecret = process.env.PATHAO_CLIENT_SECRET || '';
    this.username = process.env.PATHAO_USERNAME || '';
    this.password = process.env.PATHAO_PASSWORD || '';
  }

  async getAccessToken(): Promise<PathaoTokenResponse> {
    try {
      const response: AxiosResponse<PathaoTokenResponse> = await axios.post(
        `${this.baseURL}/aladdin/api/v1/issue-token`,
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'password',
          username: this.username,
          password: this.password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get access token: ${error.response?.data?.message || error.message}`);
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<PathaoTokenResponse> {
    try {
      const response: AxiosResponse<PathaoTokenResponse> = await axios.post(
        `${this.baseURL}/aladdin/api/v1/issue-token`,
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to refresh token: ${error.response?.data?.message || error.message}`);
    }
  }

  async createStore(accessToken: string, storeData: PathaoStoreData): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/aladdin/api/v1/stores`,
        storeData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to create store: ${error.response?.data?.message || error.message}`);
    }
  }

  async createOrder(accessToken: string, orderData: PathaoOrderData): Promise<PathaoOrderResponse> {
    try {
      const response: AxiosResponse<PathaoOrderResponse> = await axios.post(
        `${this.baseURL}/aladdin/api/v1/orders`,
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to create order: ${error.response?.data?.message || error.message}`);
    }
  }

  async createBulkOrder(accessToken: string, orders: PathaoOrderData[]): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/aladdin/api/v1/orders/bulk`,
        {
          orders: orders
        },
        {
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to create bulk order: ${error.response?.data?.message || error.message}`);
    }
  }

  async getOrderInfo(accessToken: string, consignmentId: string): Promise<PathaoOrderInfoResponse> {
    try {
      const response: AxiosResponse<PathaoOrderInfoResponse> = await axios.get(
        `${this.baseURL}/aladdin/api/v1/orders/${consignmentId}/info`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get order info: ${error.response?.data?.message || error.message}`);
    }
  }

  async getCities(accessToken: string): Promise<PathaoCity[]> {
    try {
      const response: AxiosResponse<{ data: PathaoCity[] }> = await axios.get(
        `${this.baseURL}/aladdin/api/v1/cities`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get cities: ${error.response?.data?.message || error.message}`);
    }
  }

  async getZones(accessToken: string, cityId: number): Promise<PathaoZone[]> {
    try {
      const response: AxiosResponse<{ data: PathaoZone[] }> = await axios.get(
        `${this.baseURL}/aladdin/api/v1/cities/${cityId}/zone-list`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get zones: ${error.response?.data?.message || error.message}`);
    }
  }

  async getPriceCalculation(
    accessToken: string,
    data: {
      store_id: number;
      item_type: number;
      delivery_type: number;
      item_weight: number;
      recipient_city: number;
      recipient_zone: number;
    }
  ): Promise<{ delivery_fee: number }> {
    try {
      const response = await axios.post(
        `${this.baseURL}/aladdin/api/v1/merchant/price-plan`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get price calculation: ${error.response?.data?.message || error.message}`);
    }
  }

  // Helper method to map city names to city IDs
  async getCityIdByName(accessToken: string, cityName: string): Promise<number | null> {
    try {
      const cities = await this.getCities(accessToken);
      const city = cities.find(c => 
        c.city_name.toLowerCase().includes(cityName.toLowerCase()) ||
        cityName.toLowerCase().includes(c.city_name.toLowerCase())
      );
      return city ? city.city_id : null;
    } catch (error) {
      console.error('Error getting city ID:', error);
      return null;
    }
  }

  // Helper method to get default zone for a city
  async getDefaultZoneForCity(accessToken: string, cityId: number): Promise<number | null> {
    try {
      const zones = await this.getZones(accessToken, cityId);
      return zones.length > 0 ? zones[0].zone_id : null;
    } catch (error) {
      console.error('Error getting zones:', error);
      return null;
    }
  }
}

export default new PathaoAPI();

// Export types for use in other files
export type {
  PathaoTokenResponse,
  PathaoOrderData,
  PathaoOrderResponse,
  PathaoOrderInfoResponse,
  PathaoCity,
  PathaoZone
};