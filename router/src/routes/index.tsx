import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
      <p className="mt-4 text-lg">
        Edit <code>src/routes/index.tsx</code> to get started.
      </p>
      <Link to="/about" className="mt-4 inline-block text-blue-600 underline">
        About ページへ
      </Link>
      <Link to="/products/fresh" className="mt-2 block text-blue-600 underline">
        Products 実験へ
      </Link>
      <Link to="/posts" className="mt-2 block text-blue-600 underline">
        Posts 実験へ
      </Link>
      <Link
        to="/search"
        search={{
          q: "",
          category: "all",
          sort: "name",
          page: 1,
          perPage: 10,
          inStockOnly: false,
        }}
        className="mt-2 block text-blue-600 underline"
      >
        Search Params 実験へ
      </Link>
      <Link
        to="/echo"
        search={{
          q: "",
          pageCatch: 1,
          pageDefault: 1,
          debug: "",
          tags: [],
          sort: "ASC",
          ui: "grid",
        }}
      >
        Echo
      </Link>
      <Link to="/auth" className="mt-2 block text-blue-600 underline">
        Auth check 実験へ（未認証なら Echo へ redirect）
      </Link>
      <Link to="/app/dashboard" className="mt-2 block text-blue-600 underline">
        App Dashboard 実験へ（親 route の beforeLoad で guard）
      </Link>
    </div>
  );
}
