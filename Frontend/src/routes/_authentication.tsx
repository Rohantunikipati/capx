import { get_curr_user } from "@/lib/api";
import { createFileRoute, Outlet } from "@tanstack/react-router";

const Component = () => {
  const { user } = Route.useRouteContext() ?? {}; // Ensure fallback for undefined context
  if (!user) {
    return (
      <div>
        <a href="/api/login">Login</a>
      </div>
    );
  }
  return <Outlet />;
};

// src/routes/_authenticated.tsx
export const Route = createFileRoute("/_authentication")({
  beforeLoad: async ({ context }) => {
    const queryClient = context.queryClient;
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ["get_curr_user"],
        queryFn: get_curr_user,
        staleTime: Infinity,
      });
      console.log(data);
      return data;
    } catch (error) {
      console.log(error);
      return { user: null };
    }
  },
  component: Component,
});
