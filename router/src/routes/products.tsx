import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/products")({ component: ProductsLayout });

function ProductsLayout() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Products 実験</h1>
      <p className="mt-2 text-gray-700">
        prefetch (intent) と staleTime / preloadStaleTime の組み合わせで loader
        がいつ走るかを体感します。ホバーで preload、クリックで遷移を確認してください。
      </p>

      <nav className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link
          to="/products/fresh"
          className="block rounded-lg border border-gray-300 p-4 hover:bg-gray-50"
          activeProps={{ className: "border-blue-500 bg-blue-50" }}
        >
          <div className="font-semibold">/products/fresh</div>
          <div className="mt-1 text-sm text-gray-600">
            staleTime: 0
            <br />
            ホバー (preload) も遷移も毎回 loader 実行
          </div>
        </Link>

        <Link
          to="/products/cached"
          className="block rounded-lg border border-gray-300 p-4 hover:bg-gray-50"
          activeProps={{ className: "border-blue-500 bg-blue-50" }}
        >
          <div className="font-semibold">/products/cached</div>
          <div className="mt-1 text-sm text-gray-600">
            staleTime: 30_000
            <br />
            30 秒間はホバーも遷移もキャッシュ利用
          </div>
        </Link>

        <Link
          to="/products/preload-fresh"
          className="block rounded-lg border border-gray-300 p-4 hover:bg-gray-50"
          activeProps={{ className: "border-blue-500 bg-blue-50" }}
        >
          <div className="font-semibold">/products/preload-fresh</div>
          <div className="mt-1 text-sm text-gray-600">
            staleTime: 30_000 + preloadStaleTime: 0
            <br />
            preload は毎回最新、遷移後はキャッシュ
          </div>
        </Link>
      </nav>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
