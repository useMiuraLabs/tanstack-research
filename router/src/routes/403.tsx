import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/403")({
  component: ForbiddenPage,
});

function ForbiddenPage() {
  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold">403 Forbidden</h1>
      <p className="mt-2 text-gray-600">
        このページを見る権限がありません。authenticated ではあるが、role
        が足りないときに飛ばされます。
      </p>
      <Link to="/" className="mt-4 inline-block text-blue-600 underline">
        Home へ戻る
      </Link>
    </section>
  );
}
