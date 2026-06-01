import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  beforeLoad: ({ context, location }) => {
    if (context.auth.state.status !== "authenticated") {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold">Authenticated App Area</h1>
      <p className="mt-2 text-gray-600">
        /app 配下は親 route の beforeLoad を通過した場合だけ表示されます。
      </p>
      <div className="mt-6 rounded border border-gray-200 p-4">
        <Outlet />
      </div>
    </section>
  );
}
