import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const context = Route.useRouteContext();
  const state = context.auth.state;

  if (state.status !== "authenticated") return null;

  return (
    <div>
      <h2 className="text-2xl font-semibold">Profile</h2>
      <p className="mt-2 text-gray-600">
        URL は <code>/profile</code>。<code>_authenticated</code>{" "}
        は出ていません。
      </p>
      <p className="mt-2">
        user: <strong>{state.user.name}</strong> ({state.user.role})
      </p>
    </div>
  );
}
