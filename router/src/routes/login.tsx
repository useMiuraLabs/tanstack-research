import { createFileRoute, useRouter } from "@tanstack/react-router";
import { z } from "zod";

const loginSearchSchema = z.object({
  redirect: z.string().catch("/app/dashboard"),
});

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  component: LoginPage,
});

function LoginPage() {
  const search = Route.useSearch();
  const context = Route.useRouteContext();
  const router = useRouter();
  const redirectTo = safeRedirectPath(search.redirect);

  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold">Login</h1>
      <p className="mt-2 text-gray-600">
        未認証で保護 route に入ると、このページに redirect search param
        付きで飛ばされます。
      </p>
      <dl className="mt-4 rounded border border-gray-200 p-4">
        <div>
          <dt className="font-semibold">raw redirect</dt>
          <dd className="break-all">{search.redirect}</dd>
        </div>
        <div className="mt-2">
          <dt className="font-semibold">safe redirect</dt>
          <dd className="break-all">{redirectTo}</dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={async () => {
          await context.auth.login();
          router.history.push(redirectTo);
        }}
        className="mt-4 rounded bg-blue-600 px-4 py-2 font-semibold text-white"
      >
        Login して戻る
      </button>
    </section>
  );
}

function safeRedirectPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/app/dashboard";
}
