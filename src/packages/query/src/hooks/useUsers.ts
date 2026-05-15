import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

export type UserItem = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "moderator";
  createdAt?: string;
};

type UsersResponse = {
  users: UserItem[];
};

export function useUsers() {
  return useQuery({
    queryKey: ["admin", "moderator"],
    queryFn: async () => {
      const data = await apiClient<UsersResponse>("/api/admin/users", {
        method: "GET",
        credentials: "include",
      });

      return data.users;
    },
  });
}