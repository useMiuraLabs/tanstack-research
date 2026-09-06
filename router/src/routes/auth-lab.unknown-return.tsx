import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth-lab/unknown-return")({
  beforeLoad: ({ context, location }) => {
    if (context.auth.state.status === "unknown") {
      return;
    }

    if (context.auth.state.status === "anonymous") {
      throw redirect({
        to: "/echo",
        search: {
          q: "",
          pageCatch: 1,
          pageDefault: 1,
          debug: `unknown-return redirected from ${location.href}`,
          sort: "ASC",
          tags: [],
          ui: "grid",
        },
      });
    }
  },
  loader: ({ context }) => ({
    authStatusSeenByLoader: context.auth.state.status,
    loadedAt: Date.now(),
  }),
  component: UnknownReturnPage,
});

function UnknownReturnPage() {
  const data = Route.useLoaderData();

  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold">unknown を return した route</h1>
      <p className="mt-2 text-red-600">
        unknown で return したため、保護されるべき route が loader/component まで進んでいます。
      </p>
      <dl className="mt-4 grid gap-2 rounded border border-red-200 p-4">
        <div>
          <dt className="font-semibold">loader が見た auth status</dt>
          <dd>{data.authStatusSeenByLoader}</dd>
        </div>
        <div>
          <dt className="font-semibold">loadedAt</dt>
          <dd>{new Date(data.loadedAt).toLocaleTimeString()}</dd>
        </div>
      </dl>
    </section>
  );
}
