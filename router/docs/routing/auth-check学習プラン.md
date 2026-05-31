# TanStack Router Auth Check 学習プラン

TanStack Router でログイン必須ルート・権限付きルートを扱うための学習プランです。
Next.js Middleware のような「リクエスト前のサーバ側ガード」と混同しないように、TanStack Router の auth check はまず `beforeLoad` / `redirect` / Router Context を中心に学びます。

この教材は「抽象説明だけで終わらせない」ために、各トピックに具体ユースケース・最小コード方針・観察条件・アンチパターンを入れます。

## 一次情報

- TanStack Router 公式: Authenticated Routes — <https://tanstack.com/router/latest/docs/guide/authenticated-routes>
- TanStack Router 公式: Router Context — <https://tanstack.com/router/latest/docs/guide/router-context>
- TanStack Router 公式: redirect function — <https://tanstack.com/router/latest/docs/api/router/redirectFunction>
- TanStack Router 公式: isRedirect function — <https://tanstack.com/router/latest/docs/api/router/isRedirectFunction>

## 教材の前提ユースケース

この教材では、backend なしの fake auth で B2B SaaS を想定します。

- Public routes: `/`, `/about`, `/login`
- Auth required routes: `/app/dashboard`, `/app/posts`, `/app/products`
- Admin only route: `/app/admin`
- Auth state: `unknown` / `anonymous` / `authenticated`
- User data: `id`, `name`, `role`, `workspaceId`
- Login flow: 未ログインで保護ページへ来たら `/login?redirect=<current URL>` に飛ばす
- Return flow: ログイン後に `redirect` の URL へ戻す
- Logout flow: ログアウトしたら保護ページから public 側へ戻す
- RBAC flow: `role=user` は `/app/admin` に入れない

補足: 公式ガイドでは `/_authenticated` のような pathless route で守る例もあります。この教材では初学時の混乱を避けるため、まず URL に明示的に出る `/app/*` を使います。pathless route 版は応用編で扱います。

## Next.js との対比

Next.js Middleware は、HTTP リクエストがアプリに届く前に処理するサーバ/Edge 側の層です。
TanStack Router の `beforeLoad` は、SPA の route match / load の途中で UI 遷移を止める層です。

| 観点        | Next.js Middleware                        | TanStack Router `beforeLoad`                        |
| ----------- | ----------------------------------------- | --------------------------------------------------- |
| 実行場所    | Server / Edge                             | Router の route loading lifecycle                   |
| 主な用途    | request guard, rewrite, redirect, headers | route guard, context injection, redirect            |
| 守る対象    | リクエストそのもの                        | UI route / child route loading                      |
| auth の典型 | middleware で cookie/session 判定         | Router Context の auth state を `beforeLoad` で判定 |
| 注意点      | Edge 制約がある                           | server function/API は別途守る必要がある            |

---

## 1. 一般的な学習

### Topic A: Route guard は何を守るのか

#### 1. 公式ドキュメント通りのやり方

TanStack Router では、ログイン必須ルートを `beforeLoad` で守ります。
未認証なら `throw redirect({ to: '/login' })` でログインページへ飛ばします。

公式ガイドでは、route guard は UI を守るものであり、server function などの直接アクセスは別途 handler 側で守る必要があると注意されています。

#### 2. 現場で使われるやり方

B2B SaaS では、未ログインのユーザーに dashboard や customer data を表示しないために使います。
ただしこれは「UX と route 表示を守る」層であり、API や server function の認可とは別です。

具体例:

- 未ログインで `/app/dashboard` を直打ちする
- `beforeLoad` が `/login?redirect=/app/dashboard` に飛ばす
- dashboard component / loader は実行されない

#### 3. アンチパターンとなるもの

`beforeLoad` だけでセキュリティが完結すると考えることです。
API / server function / DB access はサーバ側で認可が必要です。

#### 最小コード方針

```tsx
export const Route = createFileRoute("/app/dashboard")({
  beforeLoad: ({ context, location }) => {
    if (context.auth.status !== "authenticated") {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: Dashboard,
});
```

---

### Topic B: `beforeLoad` の実行順と subtree guard

#### 1. 公式ドキュメント通りのやり方

`beforeLoad` は親 route から子 route の順に実行されます。
親 route の `beforeLoad` が redirect や error を throw すると、子 route の loading は進みません。

#### 2. 現場で使われるやり方

ログイン必須画面を `/app` のような親 route 配下に集め、親 route の `beforeLoad` 一箇所でまとめて守ります。
これにより、ページ追加時の guard 書き忘れを構造で防げます。

具体例:

- `/app/dashboard`
- `/app/posts`
- `/app/products`
- `/app/settings`

これらを全部 `/app` の guard で守ります。

#### 3. アンチパターンとなるもの

各 route に同じ認証チェックをコピペすることです。
将来ルートが増えたとき、1ページだけ guard を忘れる事故が起きます。

#### 最小コード方針

```tsx
export const Route = createFileRoute("/app")({
  beforeLoad: ({ context, location }) => {
    if (context.auth.status !== "authenticated") {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: () => <Outlet />,
});
```

---

### Topic C: Router Context に auth state を注入する

#### 1. 公式ドキュメント通りのやり方

React hooks は `beforeLoad` や `loader` の中で呼べません。
そのため、React component 側で `useAuth()` を呼び、`<RouterProvider context={{ auth }}>` で Router Context に渡します。

Root route 側では `createRootRouteWithContext<RouterContext>()` を使い、context の型を定義します。

#### 2. 現場で使われるやり方

auth state は boolean だけにしません。
実務では、初期ロード中の状態を表す `unknown` を持たせることが多いです。

```ts
type AuthState =
  | { status: "unknown" }
  | { status: "anonymous" }
  | { status: "authenticated"; user: User };
```

具体例:

- アプリ起動直後、localStorage / cookie / auth provider から session を復元中
- この 200ms の間に `anonymous` 扱いすると、ログイン済みユーザーが一瞬 `/login` に飛ばされる
- `unknown` を別状態にしてチラつきを防ぐ

#### 3. アンチパターンとなるもの

`isAuthenticated: boolean` だけで設計することです。
初期ロード中、ログアウト済み、ログイン済みの 3 状態を区別できず、UI がチラつきます。

#### 最小コード方針

```tsx
interface RouterContext {
  auth: AuthState;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
```

```tsx
const auth = useAuth();

root.render(<RouterProvider router={router} context={{ auth }} />);
```

---

### Topic D: `unknown` 状態をどう扱うか

#### 1. 公式ドキュメント通りのやり方

公式ガイドは auth state を context 経由で渡す形を示します。
`unknown` の設計はアプリ側の責務ですが、hooks を route callbacks で呼ばないために context 注入する点は公式の流れに沿います。

#### 2. 現場で使われるやり方

`unknown` の間は、保護ページの中身を表示しないようにします。
教材では `beforeLoad` が auth 判定完了を待てるように、Router Context に `waitForReady()` のような関数を渡します。
別案として、auth 判定が終わるまで `<RouterProvider />` 自体を描画しない方法もあります。

具体例:

- `auth.status === 'unknown'` の間は `waitForReady()` で判定完了を待つ
- `anonymous` なら `/login`
- `authenticated` なら `Outlet`

#### 3. アンチパターンとなるもの

`unknown` を `anonymous` と同じ扱いにして即 redirect することです。
ログイン済みユーザーが reload のたびに `/login` を経由するような不自然な挙動になります。

逆に、`unknown` のときに `beforeLoad` で何もせず `return` するだけなのも危険です。子 route の loader/component が進み、保護コンテンツが表示される可能性があります。

#### 最小コード方針

```tsx
const auth = context.auth.status === "unknown" ? await context.auth.waitForReady() : context.auth;

if (auth.status === "anonymous") {
  throw redirect({ to: "/login", search: { redirect: location.href } });
}
```

---

### Topic E: `redirect` search param でログイン後に戻す

#### 1. 公式ドキュメント通りのやり方

未認証時に `search: { redirect: location.href }` を付けて `/login` へ redirect します。
ログイン後は `router.history.push(search.redirect)` で元の URL に戻す例が公式にあります。

#### 2. 現場で使われるやり方

戻り先には search params も含めます。
例えば `/app/posts?page=2&tag=react` へ未ログインで入ったなら、ログイン後も同じ検索状態へ戻します。

具体例:

- 未ログインで `/app/posts?page=2` を直打ち
- `/login?redirect=/app/posts?page=2` に飛ぶ
- ログイン成功
- `/app/posts?page=2` に戻る

#### 3. アンチパターンとなるもの

戻り先を `to: '/app/posts'` のように自前で再構築し、search params を落とすことです。
また、外部 URL をそのまま redirect 先に使う open redirect も避けます。

#### 最小コード方針

```tsx
const loginSearchSchema = z.object({
  redirect: z.string().catch("/app/dashboard"),
});

function safeRedirectPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/app/dashboard";
}
```

---

### Topic F: auth state 変更時の `router.invalidate()`

#### 1. 公式ドキュメント通りのやり方

Router Context の値が変わったとき、Router に再評価させるために `router.invalidate()` を呼びます。

#### 2. 現場で使われるやり方

ログイン・ログアウト・role 変更後に `router.invalidate()` を呼びます。
これにより、`beforeLoad` や loader が最新の context を見て再評価できます。

具体例:

- `/login` でログインする
- auth state が `authenticated` になる
- `router.invalidate()`
- `/app/*` の guard が通る

#### 3. アンチパターンとなるもの

auth state は変わったのに Router が古い context のまま判定する状態です。
ログインしたのに protected route へ戻れない、ログアウトしたのに protected route が残る、といった挙動になります。

#### 最小コード方針

```tsx
const router = useRouter();

function login() {
  auth.loginAsUser();
  router.invalidate();
}
```

---

### Topic G: RBAC（role-based access control）

#### 1. 公式ドキュメント通りのやり方

認証チェックと同じく、`beforeLoad` で context の user role を見て、権限不足なら redirect か error を返します。

#### 2. 現場で使われるやり方

未ログインと権限不足を分けます。

- 未ログイン: `/login`
- ログイン済みだが権限不足: `/403`

具体例:

- `role=user` で `/app/admin` を直打ち
- `/403` に飛ぶ
- `role=admin` なら `/app/admin` に入れる

#### 3. アンチパターンとなるもの

admin link を UI から隠すだけで、route 自体は守らないことです。
URL 直打ちで入れてしまいます。

#### 最小コード方針

```tsx
export const Route = createFileRoute("/app/admin")({
  beforeLoad: ({ context }) => {
    if (context.auth.status !== "authenticated") {
      throw redirect({ to: "/login" });
    }

    if (context.auth.user.role !== "admin") {
      throw redirect({ to: "/403" });
    }
  },
  component: AdminPage,
});
```

---

### Topic H: `isRedirect` で redirect と本当の error を分ける

#### 1. 公式ドキュメント通りのやり方

auth check が失敗し得る場合は `try/catch` し、`isRedirect(error)` なら再 throw します。
redirect は意図した制御フローであり、通常の error とは分けます。

#### 2. 現場で使われるやり方

認証プロバイダへの問い合わせ失敗、localStorage の破損、ネットワーク障害などを「未ログイン」と同一視しないようにします。

具体例:

- 未ログイン: `/login` へ redirect
- auth provider 障害: エラー画面または retry UI

#### 3. アンチパターンとなるもの

redirect をエラーログに流し続けることです。
意図した redirect が監視ノイズになります。

#### 最小コード方針

```tsx
beforeLoad: async ({ context, location }) => {
  try {
    if (context.auth.status !== "authenticated") {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  } catch (error) {
    if (isRedirect(error)) throw error;
    throw error;
  }
};
```

---

## 2. ハンズオン計画

### Hands-on 1: Fake auth provider を作る

#### ユースケース

backend なしで、ログイン済み/未ログイン/初期確認中を切り替えて route guard を観察します。

#### 実装対象

- `src/lib/auth.ts` または `src/auth.tsx`
- `useAuth()`
- `AuthProvider`
- `loginAsUser()`
- `loginAsAdmin()`
- `logout()`
- `status: unknown -> anonymous/authenticated` を再現する遅延

#### 観察条件

- 初回ロード直後に `unknown` 状態がある
- login user / login admin / logout を手動で切り替えられる

#### アンチパターン確認

- `isAuthenticated: boolean` だけでは初期確認中を表現できないことを確認する

---

### Hands-on 2: Router Context に auth を流す

#### ユースケース

`beforeLoad` から React hook を直接呼べないので、Router Context 経由で auth state を渡します。

#### 実装対象

- `src/routes/__root.tsx`
- `src/main.tsx`
- 必要なら `src/router.ts` への分離

#### 観察条件

- `beforeLoad({ context })` から `context.auth.status` が型付きで読める
- `context.auth.user.role` が `authenticated` のときだけ読める設計にする

#### アンチパターン確認

- `beforeLoad` の中で hook を呼ばない

---

### Hands-on 3: `/login` を作る

#### ユースケース

未ログインで保護ページへ来たユーザーをログインページへ飛ばし、ログイン後に元の URL へ戻します。

#### 実装対象

- `src/routes/login.tsx`
- `validateSearch` で `redirect` を読む
- `safeRedirectPath()` で open redirect を避ける
- user/admin login ボタン

#### 観察条件

- `/login?redirect=/app/posts?page=2` から user login すると `/app/posts?page=2` に戻る
- `/login?redirect=https://evil.example` は安全な default path に戻る

#### アンチパターン確認

- redirect search param をそのまま外部 URL として信用しない

---

### Hands-on 4: `/app` subtree を保護する

#### ユースケース

ログイン必須ページが増えても、親 route 一箇所の guard で守ります。

#### 実装対象

- `src/routes/app.tsx`
- `src/routes/app.dashboard.tsx`
- `src/routes/app.posts.tsx`

#### 観察条件

- 未ログインで `/app/dashboard` 直打ちすると `/login?redirect=...` に飛ぶ
- ログイン済みなら `Outlet` 配下が表示される
- 子 route に個別 guard を書かなくても守れている

#### アンチパターン確認

- 子 route に同じ auth check をコピペしない

---

### Hands-on 5: logout と `router.invalidate()`

#### ユースケース

保護ページ上で logout したら、そのページの表示を維持しないようにします。

#### 実装対象

- `/app` layout の header に logout ボタン
- logout 後 `router.invalidate()`
- 必要なら `/login` か `/` に遷移

#### 観察条件

- `/app/dashboard` で logout すると保護コンテンツが見えなくなる
- 再度 `/app/dashboard` へ直打ちすると login に飛ぶ

#### アンチパターン確認

- auth state だけ変えて Router の再評価をしない状態を避ける

---

### Hands-on 6: `/app/admin` で RBAC を実装する

#### ユースケース

ログイン済みでも role によって入れるページを分けます。

#### 実装対象

- `src/routes/403.tsx`
- `src/routes/app.admin.tsx`

#### 観察条件

- user login で `/app/admin` へ行くと `/403`
- admin login なら `/app/admin` が表示される

#### アンチパターン確認

- admin link を隠すだけではなく route 自体を守る

---

### Hands-on 7: redirect と error を分ける

#### ユースケース

未ログインは制御フローとして redirect、auth provider 障害は error として扱います。

#### 実装対象

- auth check が例外を投げる debug ボタンまたは fake flag
- `isRedirect` を使った catch
- errorComponent

#### 観察条件

- 未ログインは `/login` に飛ぶ
- fake auth error は errorComponent に出る
- redirect が error として扱われない

#### アンチパターン確認

- redirect を監視エラー扱いしない

---

## 教材作成時の注意

- 各ハンズオンは必ず「直打ち URL」で確認する
- Link クリックだけで成功判定しない
- search params 付き redirect を必ず確認する
- `unknown` 状態を意図的に作り、チラつきの有無を確認する
- 実装後は `pnpm build` または `pnpm lint` で余計な式文や型崩れを検出する

## 到達目標

- Next.js Middleware と TanStack Router `beforeLoad` の層の違いを説明できる
- Router Context 経由で auth state を route guard に渡せる
- `/app` のような subtree guard で保護ページをまとめて守れる
- `/login?redirect=...` の戻り先設計ができる
- `router.invalidate()` が必要な場面を説明できる
- RBAC を route guard として実装できる
- redirect と error を `isRedirect` で分離できる
