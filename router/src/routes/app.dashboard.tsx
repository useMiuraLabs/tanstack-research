import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <p className="mt-2 text-gray-600">
        この子 route 自体には beforeLoad を置いていません。親の /app guard で守られています。
      </p>
    </div>
  );
}
