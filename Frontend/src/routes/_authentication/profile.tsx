import { createFileRoute } from "@tanstack/react-router";
import { useUserQuery } from "@/lib/api";

export const Route = createFileRoute("/_authentication/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { isLoading, error, data } = useUserQuery();

  if (isLoading) return <p>Loading</p>;
  if (error) return <p>Error</p>;

  console.log(data);
  return (
    <div>
      Hello {data?.user.given_name || "loading"}
      <a href="/api/logout">logOut?</a>
    </div>
  );
  return <h1>hi</h1>;
}
