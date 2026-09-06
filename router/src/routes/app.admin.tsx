import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/admin")({
  beforeLoad: ({ context }) => {
    // 親 /app guard で authenticated は保証済み。ここでは role だけ判定する。
    if (
      context.auth.state.status !== "authenticated" ||
      context.auth.state.user.role !== "admin"
    ) {
      throw redirect({ to: "/403" });
    }
  },
  component: AdminPage,
});

function AdminPage() {
  const context = Route.useRouteContext();
  const state = context.auth.state;

  if (state.status !== "authenticated") return null;

  return (
    <section>
      <h2 className="text-2xl font-semibold">Admin Page</h2>
      <p className="mt-2 text-gray-600">
        admin role の user だけが表示できます。親 /app guard が authenticated
        を保証し、ここでは role だけを判定しています。
      </p>
      <p className="mt-2">
        user: <strong>{state.user.name}</strong> ({state.user.role})
      </p>
    </section>
  );
}
