# TanStack Router 学習ガイド

このリポジトリは TanStack Router の設計思想を体感するための学習用プロジェクトです。
**公式ドキュメントを一次情報として参照しながら進める** ことを基本方針とします。

## 進め方の原則

- 各ステップで該当する公式 Guide ページを読む → 要点を整理 → `src/routes/` に手を動かす、のサイクル
- いきなり実装に入らず、まず公式の説明を読んで思想を理解してから書く
- 不明点はあなたの推測ではなく、公式ドキュメントや GitHub の examples を根拠にする

## 学習順 (公式 Guide ベース)

公式の Guide セクションの並びに沿った推奨順序です。

### Step 1. Routing Concepts

- URL: https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts
- 学ぶこと: File-based routing と Code-based routing の違い、`__root` ルートの意味、`Outlet` によるネストレンダリング
- 体感ポイント: ルートが TypeScript の型として存在することの嬉しさ

### Step 2. Route Trees & Nesting

- URL: https://tanstack.com/router/latest/docs/framework/react/guide/route-trees
- 学ぶこと: ファイル命名規約 (`$param`, `_layout`, `(group)`, `index` など)、`routeTree.gen.ts` の自動生成
- 体感ポイント: ファイル名だけでルート構造が決まる宣言的な設計

### Step 3. Route Matching

- URL: https://tanstack.com/router/latest/docs/framework/react/guide/route-matching
- 学ぶこと: マッチング優先順位、pathless route、catch-all
- 体感ポイント: あいまいさのないルート解決のルール

### Step 4. Navigation

- URL: https://tanstack.com/router/latest/docs/framework/react/guide/navigation
- 学ぶこと: `<Link>` の型安全な `to` / `params` / `search`、`useNavigate`、`defaultPreload: 'intent'`
- 体感ポイント: `to="/posts/$postId"` を書くと params が必須になる型の力

### Step 5. Path Params

- URL: https://tanstack.com/router/latest/docs/framework/react/guide/path-params
- 学ぶこと: `$id` の宣言、`Route.useParams()` の型推論
- 体感ポイント: パラメータが型付きで取れる

### Step 6. Search Params ★ 思想の核心

- URL: https://tanstack.com/router/latest/docs/framework/react/guide/search-params
- 学ぶこと: `validateSearch` (Zod など)、`<Link search={...}>` の型安全、`Route.useSearch()`
- 体感ポイント: search params が第一級の状態管理として扱われる。Next.js の `useSearchParams()` で文字列をパースする世界との断絶

### Step 7. Data Loading

- URL: https://tanstack.com/router/latest/docs/framework/react/guide/data-loading
- 学ぶこと: `loader`、`Route.useLoaderData()`、`staleTime` / `gcTime`、`defaultPreload` との連動
- 体感ポイント: データ取得がルートに紐づく (Remix 的)。`useEffect + fetch` を書かない世界

### Step 8. Route Context

- URL: https://tanstack.com/router/latest/docs/framework/react/guide/router-context
- 学ぶこと: `beforeLoad` での context 注入、親から子への型安全な継承、認証チェックパターン
- 体感ポイント: ミドルウェア的な処理が型を保ったまま流れる

## 補助リソース

- 公式 Examples: https://tanstack.com/router/latest/docs/framework/react/examples/basic
- API Reference: https://tanstack.com/router/latest/docs/framework/react/api/router/RouterClass
- GitHub: https://github.com/TanStack/router

## このプロジェクトの現状

- Vite + React 19 + TanStack Router (file-based) + Tailwind v4
- `@tanstack/router-plugin` の `autoCodeSplitting: true` でルート単位の自動コード分割が有効
- `defaultPreload: 'intent'` でホバー時 prefetch が有効
- DevTools 設定済み (`__root.tsx`)

## 学習方針メモ

- Step 1-2 でファイルベースルーティングの骨格を理解
- Step 3-5 で基本ナビゲーションを体に染み込ませる
- Step 6 で「他のルーターと違う」と最も強く感じられるはず
- Step 7-8 でデータ層とミドルウェア層に踏み込む
- ここまで終えたら TanStack Start (SSR + Server Functions) への接続が自然
