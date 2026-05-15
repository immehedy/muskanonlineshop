import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import { queryKeys } from "../queryKeys";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
};

type CurrentUserResponse = {
  user: CurrentUser;
};

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.currentUser,

    queryFn: async () => {
      const data = await apiClient<CurrentUserResponse>("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      return data.user;
    },

    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}