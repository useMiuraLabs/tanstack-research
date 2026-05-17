import { Link, createFileRoute } from '@tanstack/react-router'
import { fetchPost } from '../lib/fakeApi'

export const Route = createFileRoute('/posts/$postId')({
  loader: ({ params }) => fetchPost(params.postId),
  component: PostDetail,
})

function PostDetail() {
  const params = Route.useParams()
  const post = Route.useLoaderData()

  return (
    <article className="rounded-lg border border-gray-200 p-6">
      <Link to="/posts" className="text-sm text-blue-600 underline">
        一覧に戻る
      </Link>
      <p className="mt-4 text-sm text-gray-500">postId: {params.postId}</p>
      {post ? (
        <>
          <h2 className="mt-2 text-2xl font-bold">{post.title}</h2>
          <p className="mt-4 text-gray-700">{post.body}</p>
        </>
      ) : (
        <p className="mt-2 text-lg text-red-600">投稿が見つかりません</p>
      )}
    </article>
  )
}
