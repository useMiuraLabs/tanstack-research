import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

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
      <Link
        to="/products/fresh"
        className="mt-2 block text-blue-600 underline"
      >
        Products 実験へ
      </Link>
      <Link to="/posts" className="mt-2 block text-blue-600 underline">
        Posts 実験へ
      </Link>
    </div>
  )
}
