export const queryKeys = {
    products: ["products"] as const,
    product: (slug: string) => ["product", slug] as const,
  
    adminOrders: ["admin", "orders"] as const,
    adminOrder: (id: string) => ["admin", "orders", id] as const,
  
    currentUser: ["auth", "current-user"] as const,
  };