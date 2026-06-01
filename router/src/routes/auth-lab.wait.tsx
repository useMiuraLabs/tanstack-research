import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth-lab/wait")({
  beforeLoad: async ({ context, location }) => {
    const auth =
      context.auth.state.status === "unknown"
        ? await context.auth.waitForReady()
        : context.auth.state;

    if (auth.status === "anonymous") {
      throw redirect({
        to: "/echo",
        search: {
          q: "",
          pageCatch: 1,
          pageDefault: 1,
          debug: `wait resolved anonymous from ${location.href}`,
          sort: "ASC",
          tags: [],
          ui: "grid",
        },
      });
    }

    return { authStatusAfterWait: auth.status };
  },
  pendingComponent: () => (
    <div className="p-8 text-gray-600">auth 判定完了を待っています...</div>
  ),
  component: WaitPage,
});

function WaitPage() {
  const context = Route.useRouteContext();

  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold">wait してから解決する route</h1>
      <p className="mt-2 text-emerald-700">
        waitForReady が authenticated を返した場合だけ、この component が表示されます。
      </p>
      <p className="mt-4">authStatusAfterWait: {context.authStatusAfterWait}</p>
    </section>
  );
}
