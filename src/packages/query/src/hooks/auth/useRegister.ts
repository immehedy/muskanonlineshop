import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../apiClient";
import { queryKeys } from "../../queryKeys";


type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "moderator";
};

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterInput) =>
      apiClient("/api/auth/register", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(payload),
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.currentUser,
      });
    },
  });
}