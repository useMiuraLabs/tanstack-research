import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/posts")({ component: PostsLayout });

function PostsLayout() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Posts</h1>
      <Link to="/" className="mt-2 inline-block text-blue-600 underline">
        Home へ
      </Link>
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}
