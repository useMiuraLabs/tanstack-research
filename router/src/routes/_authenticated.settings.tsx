import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold">Settings</h2>
      <p className="mt-2 text-gray-600">
        URL は <code>/settings</code>。子 route 側は guard を意識せず、
        自分の責務だけ書けば良い。
      </p>
    </div>
  );
}
