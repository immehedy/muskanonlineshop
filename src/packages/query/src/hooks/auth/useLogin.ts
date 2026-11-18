import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../apiClient";

type LoginInput = {
  email: string;
  password: string;
};

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginInput) =>
      apiClient("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}
