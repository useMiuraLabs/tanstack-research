# TanStack Router Auth Check 引き継ぎ書

## 目的

TanStack Router の auth check / route guard 学習を、別のAIまたは後続作業者がそのまま再開できるようにするための引き継ぎ書です。

この教材の本質は、TanStack Router が認可モデルを提供することではなく、`beforeLoad` / Router Context / route tree を使って「UI route に入れるか」を型付きで制御できることを体感することです。

## 一次情報

- Authenticated Routes: <https://tanstack.com/router/latest/docs/guide/authenticated-routes>
- Router Context: <https://tanstack.com/router/latest/docs/guide/router-context>
- redirect function: <https://tanstack.com/router/latest/docs/api/router/redirectFunction>
- isRedirect function: <https://tanstack.com/router/latest/docs/api/router/isRedirectFunction>

## 重要な前提

- backend / API の認可は別で必ず必要。
- TanStack Router の `beforeLoad` は frontend UI / route loading の UX guard。
- Next.js Middleware / Proxy のような request-level guard ではない。
- 現在の fake auth は教材用で、production pattern ではない。
- 現在は module-level object `initialAuthContext` を mutate している。
- 実プロダクトでは `AuthProvider` / `useAuth` / auth library から Router Context に流す構成にする。

## 学習で完了したこと

### Topic A: Route guard は何を守るのか

- `beforeLoad` は UI route / loader / component を通すかを判断する層。
- API / backend / server function の認可とは別。
- `location.href` を使って元の URL を `/login?redirect=...` に保存する流れを理解済み。

### Topic B: `beforeLoad` の実行順と subtree guard

- 親 route の `beforeLoad` は子 route より先に走る。
- `/app` 親 route で `/app/dashboard` をまとめて guard する実験済み。
- child route に認証 check をコピペしない設計を確認済み。

### Topic C: Router Context

- `createRootRouteWithContext<RouterContext>()` で root context 型を定義済み。
- `createRouter({ context })` で `auth` を注入済み。
- `beforeLoad({ context })` で auth を読む流れを確認済み。
- Router Context は TanStack Router の機能名。概念的には DI に近い。

### Topic D: `unknown` 状態

- `unknown` を `return` すると「待つ」ではなく「通す」。
- `/auth-lab/unknown-return` で loader/component まで進むアンチパターンを実装済み。
- `/auth-lab/wait` で `waitForReady()` を `await` して判定完了まで route loading を止める実験済み。

### Topic E: `/login?redirect=...`

- `/app` guard から `/login?redirect=<location.href>` に redirect 済み。
- `/login` 側で `redirect` search param を読み、login 後に `router.history.push(redirectTo)` で戻す実験済み。
- `safeRedirectPath()` で外部 URL / `//evil.example` を弾く処理を実装済み。

### Topic F: `router.invalidate()`

- `router.invalidate()` は active route match / `beforeLoad` / loader / Router cache の再評価トリガー。
- `/app` layout に `Logout だけ` と `Logout + invalidate` の比較実験を実装済み。
- logout 後に current protected route に居続ける場合、`router.invalidate()` で `/app` guard を再評価できることを体感済み。
- logout 後に `/login` や LP へ明示 navigate するなら、invalidate なしでも UX として成立しやすい、という整理済み。

## 現在の実装状態

### 既存 route

- `/login`
  - `router/src/routes/login.tsx`
  - `redirect` search param を validate
  - `User として login` / `Admin として login` ボタンを途中実装済み

- `/app`
  - `router/src/routes/app.tsx`
  - 親 route guard
  - authenticated でなければ `/login?redirect=<location.href>`
  - authenticated の場合は `return { user }` して child context に流す途中実装済み
  - logout / invalidate 比較 UI あり

- `/app/dashboard`
  - `router/src/routes/app.dashboard.tsx`
  - child route 自体には guard なし
  - 親 `/app` guard で守られる

- `/auth-lab/unknown-return`
  - `router/src/routes/auth-lab.unknown-return.tsx`
  - `unknown` で `return` してしまうアンチパターン

- `/auth-lab/wait`
  - `router/src/routes/auth-lab.wait.tsx`
  - `waitForReady()` を await してから判定

- `/auth`
  - `router/src/routes/auth.tsx`
  - 初期教材用の単発 guard route

## 現在の途中変更

作業途中の差分があります。現時点ではコミットしない方が安全です。

変更中のファイル:

- `router/src/auth.tsx`
- `router/src/routes/app.tsx`
- `router/src/routes/login.tsx`
- `AUTH_CHECK_HANDOFF.md`

直近で確認したこと:

- `pnpm exec tsc --noEmit` は成功済み。
- Topic G の追加 route はまだ未完成なので、`pnpm build` / `pnpm lint` は Topic G 完了後に改めて実行すること。

## Topic G の現在地

Topic G は「child route に個別 guard を置く」実験です。

本質:

```txt
/app        = 親 route で authenticated guard
/app/admin  = 子 route で admin guard を追加
```

RBAC を frontend が保証する話ではありません。backend 側の認可は別途必要です。

### すでに入っている Topic G の途中変更

`router/src/auth.tsx`:

- `UserRole = 'user' | 'admin'`
- `AuthUser = { id, name, role }`
- `AuthState.authenticated` に `user` を追加
- `loginAsUser()` / `loginAsAdmin()` を追加

`router/src/routes/app.tsx`:

- `/app` の `beforeLoad` が authenticated の場合に `return { user: context.auth.state.user }`
- `AppLayout` が `context.user.name` / `context.user.role` を表示

`router/src/routes/login.tsx`:

- `User として login`
- `Admin として login`
- どちらも login 後に `router.history.push(redirectTo)`

## 次にやること

### 1. `/403` route を作る

ファイル案:

- `router/src/routes/403.tsx`

目的:

- authenticated だが role 不足のときの landing page。
- `/login` に戻すと「未ログイン」と「権限不足」が混ざるため、教材上は `/403` に分ける。

最小コード方針:

```tsx
import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/403')({
  component: ForbiddenPage,
})

function ForbiddenPage() {
  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold">403 Forbidden</h1>
      <p className="mt-2 text-gray-600">このページを見る権限がありません。</p>
      <Link to="/" className="mt-4 inline-block text-blue-600 underline">
        Home へ戻る
      </Link>
    </section>
  )
}
```

### 2. `/app/admin` route を作る

ファイル案:

- `router/src/routes/app.admin.tsx`

目的:

- 親 `/app` guard が authenticated を保証する。
- 子 `/app/admin` は追加条件として `context.user.role === 'admin'` だけを見る。

最小コード方針:

```tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app/admin')({
  beforeLoad: ({ context }) => {
    if (context.user.role !== 'admin') {
      throw redirect({ to: '/403' })
    }
  },
  component: AdminPage,
})

function AdminPage() {
  const context = Route.useRouteContext()

  return (
    <section>
      <h2 className="text-2xl font-semibold">Admin Page</h2>
      <p className="mt-2 text-gray-600">admin role の user だけが表示できます。</p>
      <p className="mt-2">user: {context.user.name}</p>
    </section>
  )
}
```

### 3. root page に導線を追加

`router/src/routes/index.tsx` に追加:

- `/login?redirect=/app/admin`
- `/app/admin`

目的:

- user login で `/app/admin` に戻ると `/403`
- admin login で `/app/admin` に戻ると表示

### 4. 検証

Topic G 完了後に以下を実行:

```sh
pnpm build
pnpm exec tsc --noEmit
pnpm lint
```

`pnpm build` は file-based route 追加後に `routeTree.gen.ts` を更新するため必要です。

## 動作確認シナリオ

### Scenario 1: user は admin に入れない

1. `/login?redirect=/app/admin` にアクセス
2. `User として login`
3. `/app/admin` に戻る
4. `/app` 親 guard は通る
5. `/app/admin` 子 guard で `role !== 'admin'`
6. `/403` に redirect

### Scenario 2: admin は admin に入れる

1. `/login?redirect=/app/admin` にアクセス
2. `Admin として login`
3. `/app/admin` に戻る
4. `/app` 親 guard は通る
5. `/app/admin` 子 guard も通る
6. Admin page が表示される

### Scenario 3: 未ログイン直打ち

1. `/app/admin` を直打ち
2. `/app` 親 guard が先に走る
3. `/login?redirect=/app/admin` に redirect

## 注意点

- `/app/admin` 側で再度 authenticated check を書かないこと。
- 今回の教材の焦点は「親 guard の return context を子が読む」こと。
- `context.user` は `/app` の `beforeLoad` が返して初めて子 route で読める。
- frontend の role check は UX guard であり、真の認可は backend/API 側で行う。
- `routeTree.gen.ts` は生成物なので手編集しない。
- 新 route 追加後は `pnpm build` で routeTree を更新する。

## Auth check 教材の完了条件

この引き継ぎ書の計画で auth check を「終わり」と言えるのは、少なくとも以下を満たしたときです。

- Topic G: `/app/admin` child guard が完成している
  - `/403` route がある
  - user login で `/app/admin` に行くと `/403`
  - admin login で `/app/admin` に入れる
  - 未ログインで `/app/admin` 直打ちすると `/login?redirect=/app/admin`

- Topic H: redirect と本当の error の分離を体感している
  - `isRedirect(error)` を使う例がある
  - intentional redirect を通常 error として扱わない説明/実験がある
  - fake auth error などで `errorComponent` または retry UI を確認できる

- Pathless route 版の auth guard を確認している
  - 公式例の `/_authenticated` 的な pathless route を、この repo の file-based routing で実験する
  - `/app` のように URL に出る layout route との違いを説明できる

- fake auth 教材コードを整理している
  - `auth.tsx` の意図が分かる
  - `unknown` / `anonymous` / `authenticated` / `user.role` の役割が明確
  - module-level mutable object が教材用であることをコメントまたは docs に明記

- 検証が通っている
  - `pnpm build`
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`

- コミットされている
  - Topic G 以降の auth check 完了差分が commit 済み

## Topic G の次にやること

### Topic H: redirect と本当の error を分ける

目的:

- `throw redirect()` は正常な制御フローであり、通常の error とは分ける。
- auth provider 障害・localStorage 破損・network error などは、未ログイン redirect と同一視しない。

実装案:

- fake auth に `shouldFailAuthCheck` のような debug flag を追加する。
- `beforeLoad` 内で try/catch する実験 route を作る。
- `isRedirect(error)` の場合は `throw error` で再 throw。
- それ以外は `throw error` して `errorComponent` で表示。

最小コード方針:

```tsx
beforeLoad: async ({ context, location }) => {
  try {
    if (context.auth.state.status !== 'authenticated') {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }

    if (context.auth.shouldFailAuthCheck) {
      throw new Error('Fake auth provider failed')
    }
  } catch (error) {
    if (isRedirect(error)) throw error
    throw error
  }
}
```

注意:

- redirect を監視 error として扱わない。
- 本番では auth provider 障害を `/login` に雑に寄せない設計もあり得る。

### Pathless route 版の auth guard

目的:

- URL に出る `/app` layout guard と、URL に出ない `/_authenticated` pathless guard の違いを体感する。
- 公式の authenticated routes 例に近い形を確認する。

実装案:

- `router/src/routes/_authenticated.tsx`
- `router/src/routes/_authenticated.profile.tsx` など

確認すること:

- URL は `/profile` のように `_authenticated` が出ない。
- ただし route tree 上は `_authenticated` の `beforeLoad` を通る。
- `/app` のような明示 URL segment と、pathless guard の使い分けを説明できる。

### 実装整理

目的:

- 教材コードとして読みやすい状態にする。
- fake auth が「本番向けではない」ことを明記する。

整理対象:

- `router/src/auth.tsx`
- `router/src/routes/login.tsx`
- `router/src/routes/app.tsx`
- `router/src/routes/auth-lab.*.tsx`
- `router/docs/routing/auth-check学習プラン.md`
- `AUTH_CHECK_HANDOFF.md`

## 最後にコミットするときの候補

Topic G だけなら:

```txt
feat: child guard を体感
```

auth check 全体を終わらせたなら:

```txt
feat: auth guard を体感
```
