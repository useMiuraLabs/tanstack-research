import { useState } from "react";
import {
  Outlet,
  createFileRoute,
  redirect,
  useRouter,
} from "@tanstack/react-router";

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
  const context = Route.useRouteContext();
  const router = useRouter();
  const [lastAction, setLastAction] = useState("まだ logout していません");

  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold">Authenticated App Area</h1>
      <p className="mt-2 text-gray-600">
        /app 配下は親 route の beforeLoad を通過した場合だけ表示されます。
      </p>
      <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p>
          現在の auth status: <strong>{context.auth.state.status}</strong>
        </p>
        <p className="mt-1">最後の操作: {lastAction}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              context.auth.logout();
              setLastAction(
                "logout だけ実行。beforeLoad は再評価されないので、この画面に残ります。",
              );
            }}
            className="rounded border border-amber-400 px-3 py-1 font-semibold"
          >
            Logout だけ
          </button>
          <button
            type="button"
            onClick={async () => {
              context.auth.logout();
              setLastAction(
                "logout 後に router.invalidate() を実行。/app guard が再評価されます。",
              );
              await router.invalidate();
            }}
            className="rounded bg-amber-700 px-3 py-1 font-semibold text-white"
          >
            Logout + invalidate
          </button>
        </div>
      </div>
      <div className="mt-6 rounded border border-gray-200 p-4">
        <Outlet />
      </div>
    </section>
  );
}
