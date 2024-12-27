import { hc } from "hono/client";

import { type ApiRoutes } from "@server/app";
import { useQuery } from "@tanstack/react-query";


const client = hc<ApiRoutes>("/");

export const api = client.api;

export const get_curr_user = async () => {
  const res = await api.me.$get();
  if (!res.ok) {
    throw new Error("Server error");
  }
  const data = await res.json();
  return data;
};

export const useUserQuery = () => {
  return useQuery({
    queryKey: ["get_curr_user"],
    queryFn: get_curr_user,
    staleTime: Infinity, // Ensure proper property name (not scaleTime)
  });
};
