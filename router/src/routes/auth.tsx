import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  beforeLoad: ({ context, location }) => {
    if (context.auth.state.status !== "authenticated") {
      throw redirect({
        to: "/echo",
        search: {
          q: "",
          pageCatch: 1,
          pageDefault: 1,
          debug: `redirected from ${location.href}`,
          sort: "ASC",
          tags: [],
          ui: "grid",
        },
      });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  return <div>認証済みユーザーだけが見えるページです</div>;
}
