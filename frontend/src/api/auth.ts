import { apiClient } from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<string> {
  const { data } = await apiClient.post<{ access_token: string }>("/auth/login", payload);
  return data.access_token;
}
