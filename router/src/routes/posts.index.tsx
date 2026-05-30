import { Link, createFileRoute } from '@tanstack/react-router'
import { fetchPosts } from '../lib/fakeApi'

export const Route = createFileRoute('/posts/')({
  loader: () => fetchPosts(),
  component: PostsIndex,
})

function PostsIndex() {
  const posts = Route.useLoaderData()
  return (
    <ul className="grid gap-3">
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            to="/posts/$postId"
            params={{ postId: post.id }}
            className="block rounded-lg border border-gray-300 p-4 hover:bg-gray-50"
          >
            <span className="text-sm text-gray-500">#{post.id}</span>
            <div className="font-semibold">{post.title}</div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
