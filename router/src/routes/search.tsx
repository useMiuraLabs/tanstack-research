import { Link, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { searchProducts } from "../lib/fakeApi";

const searchSchema = z.object({
  q: z.string().catch(""),
  category: z.enum(["book", "food", "gadget", "all"]).catch("all"),
  sort: z.enum(["name", "price-asc", "price-desc"]).catch("name"),
  page: z.number().int().min(1).catch(1),
  perPage: z.number().int().min(5).max(50).catch(10),
  inStockOnly: z.boolean().catch(false),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    q: search.q,
    category: search.category,
    sort: search.sort,
    page: search.page,
    perPage: search.perPage,
    inStockOnly: search.inStockOnly,
  }),
  loader: ({ deps }) => searchProducts(deps),
  component: SearchPage,
});

function SearchPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const result = Route.useLoaderData();

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Search Params 実験</h1>

      <section className="grid gap-4 rounded-lg border border-gray-200 p-4 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">キーワード (q)</span>
          <input
            type="text"
            value={search.q}
            onChange={(e) => {
              const value = e.target.value;
              navigate({
                search: (prev) => ({ ...prev, q: value, page: 1 }),
              });
            }}
            className="rounded border border-gray-300 px-2 py-1"
            placeholder="例: イヤホン"
          />
        </label>

        <fieldset className="flex flex-col gap-1">
          <legend className="text-sm text-gray-600">カテゴリ</legend>
          <div className="flex flex-wrap gap-3">
            {(["all", "book", "food", "gadget"] as const).map((c) => (
              <label key={c} className="flex items-center gap-1">
                <input
                  type="radio"
                  name="category"
                  checked={search.category === c}
                  onChange={() =>
                    navigate({
                      search: (prev) => ({ ...prev, category: c, page: 1 }),
                    })
                  }
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">ソート</span>
          <select
            value={search.sort}
            onChange={(e) => {
              const value = e.target.value as typeof search.sort;
              navigate({ search: { ...search, sort: value, page: 1 } });
            }}
            className="rounded border border-gray-300 px-2 py-1"
          >
            <option value="name">name</option>
            <option value="price-asc">price-asc</option>
            <option value="price-desc">price-desc</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={search.inStockOnly}
            onChange={(e) => {
              const checked = e.target.checked;
              navigate({
                search: (prev) => ({ ...prev, inStockOnly: checked, page: 1 }),
              });
            }}
          />
          <span className="text-sm text-gray-700">在庫ありのみ</span>
        </label>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            総件数: {result.total} 件 / ページ {result.page} / {result.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }),
                })
              }
              disabled={result.page <= 1}
              className="rounded border border-gray-300 px-3 py-1 disabled:opacity-40"
            >
              前へ
            </button>
            <Link
              from="/search"
              search={(prev) => ({ ...prev, page: prev.page + 1 })}
              disabled={result.page >= result.totalPages}
              className="rounded border border-gray-300 px-3 py-1 aria-disabled:pointer-events-none aria-disabled:opacity-40"
            >
              次へ (Link)
            </Link>
          </div>
        </div>

        <ul className="grid gap-2 md:grid-cols-2">
          {result.items.map((item) => (
            <li key={item.id} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{item.name}</span>
                <span className="text-xs uppercase text-gray-500">{item.category}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="tabular-nums">¥{item.price.toLocaleString()}</span>
                <span className={item.inStock ? "text-emerald-600" : "text-rose-600"}>
                  {item.inStock ? "In stock" : "Out of stock"}
                </span>
              </div>
            </li>
          ))}
          {result.items.length === 0 && (
            <li className="col-span-full rounded border border-dashed border-gray-300 p-6 text-center text-gray-500">
              該当なし
            </li>
          )}
        </ul>
      </section>

      <section className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm">
        <h3 className="text-base font-semibold text-amber-900">体感ポイント</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-900">
          <li>
            URL を直接書き換えて不正値 (例:{" "}
            <code className="rounded bg-amber-100 px-1">?sort=banana</code>) を 入れても{" "}
            <code>catch</code> がデフォルト値に倒すこと
          </li>
          <li>ブラウザの戻る/進むで search params 状態が完全に復元されること</li>
          <li>
            <code>Route.useSearch()</code> の戻り値の型を hover で確認 (Zod schema から推論される)
          </li>
          <li>
            functional update <code>{`(prev) => ({ ...prev, page: prev.page + 1 })`}</code>{" "}
            を使うと既存 params のマージが綺麗に書ける
          </li>
          <li>
            <code>loaderDeps</code> に指定した search params が変わると loader が再実行される (cache
            key に含まれる)
          </li>
        </ul>
      </section>
    </div>
  );
}
