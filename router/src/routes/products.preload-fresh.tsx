import { createFileRoute } from '@tanstack/react-router'
import { fetchProduct } from '../lib/fakeApi'

export const Route = createFileRoute('/products/preload-fresh')({
  loader: () => fetchProduct('preload-fresh'),
  staleTime: 30_000,
  preloadStaleTime: 0,
  component: ProductPage,
})

function ProductPage() {
  const product = Route.useLoaderData()
  return (
    <section className="rounded-lg border border-gray-200 p-6">
      <p className="text-sm text-gray-500">
        戦略: staleTime 30s + preloadStaleTime 0 — prefetch は常に最新、ナビ後はキャッシュ
      </p>
      <h2 className="mt-2 text-2xl font-bold">{product.name}</h2>
      <dl className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-sm text-gray-500">stock</dt>
          <dd className="text-4xl font-bold tabular-nums">{product.stock}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">fetchedAt</dt>
          <dd className="text-4xl font-bold tabular-nums">
            {new Date(product.fetchedAt).toLocaleTimeString()}
          </dd>
        </div>
      </dl>
    </section>
  )
}
