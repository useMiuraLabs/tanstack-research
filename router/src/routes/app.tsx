import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/echo",
        search: {
          q: "login しろぼけ",
          pageCatch: 1,
          pageDefault: 1,
          debug: `app guard redirected from ${location.href}`,
          sort: "ASC",
          tags: [],
          ui: "grid",
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
