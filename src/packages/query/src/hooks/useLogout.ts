import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import { queryKeys } from "../queryKeys";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiClient("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    },

    onSuccess: async () => {
      // remove current user cache
      queryClient.removeQueries({
        queryKey: queryKeys.currentUser,
      });

      // optional: clear all cache
      await queryClient.clear();

      // redirect
      window.location.href = "/login";
    },
  });
}