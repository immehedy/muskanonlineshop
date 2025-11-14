// utils/api.ts

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method: HttpMethod;
  url: string;
  data?: unknown;
}

const BASE_URL = ''; // Optional: set your API base URL if needed

async function request<T>({ method, url, data }: RequestOptions): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${BASE_URL}${url}`, options);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const errorMessage = (errorBody as { message?: string }).message || 'API request failed';
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

const api = {
  get: <T>(url: string) => request<T>({ method: 'GET', url }),
  post: <T>(url: string, data: unknown) => request<T>({ method: 'POST', url, data }),
  put: <T>(url: string, data: unknown) => request<T>({ method: 'PUT', url, data }),
  patch: <T>(url: string, data: unknown) => request<T>({ method: 'PATCH', url, data }),
  delete: <T>(url: string) => request<T>({ method: 'DELETE', url }),
};

export default api;
