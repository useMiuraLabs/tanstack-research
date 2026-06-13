import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    if (context.auth.state.status !== "authenticated") {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold">Pathless Layout</h1>
      <p className="mt-2 text-gray-600">
        この layout は URL に出ません。URL は <code>/profile</code> や{" "}
        <code>/settings</code> のまま、render tree にだけ挟まります。
      </p>
      <nav className="mt-4 flex gap-4">
        <Link
          to="/profile"
          className="text-blue-600 underline"
          activeProps={{ className: "font-bold" }}
        >
          Profile
        </Link>
        <Link
          to="/settings"
          className="text-blue-600 underline"
          activeProps={{ className: "font-bold" }}
        >
          Settings
        </Link>
      </nav>
      <div className="mt-6 rounded border border-gray-200 p-4">
        <Outlet />
      </div>
    </section>
  );
}
