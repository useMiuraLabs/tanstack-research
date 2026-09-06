# TanStack Router Search Middleware 学習プラン

TanStack Router の middleware 系のうち、まずは Search Params の `search.middlewares` を対象にします。
目的は、URL を状態として扱いながら、URL の正規化・引き回し・不要値の除去を Router の思想に沿って理解することです。

## 一次情報

- TanStack Router 公式: Search Params — <https://tanstack.com/router/latest/docs/guide/search-params>
- TanStack Router 公式: Custom Search Param Serialization — <https://tanstack.com/router/latest/docs/guide/custom-search-param-serialization>
- TanStack Router 公式: Data Loading — <https://tanstack.com/router/latest/docs/guide/data-loading>

## 学習範囲

このプランでは `beforeLoad` を認可 middleware 的に使う話は一旦扱わず、Search Params の middleware に絞ります。

- `search.middlewares`
- `retainSearchParams`
- `stripSearchParams`
- custom middleware
- middleware と `loaderDeps` の関係
- middleware と serializer の境界

---

## 1. 一般的な学習

### Topic A: Search middleware の役割と実行タイミング

#### 1. 公式ドキュメント通りのやり方

`search.middlewares` は、Link の href 生成時と navigation 時に search params を変形する仕組みです。
middleware は `({ search, next }) => next(search)` の形でチェーンされます。

#### 2. 現場で使われるやり方

Search middleware は、URL の正規化層として使います。

- 常に残したい search params を保持する
- デフォルト値を URL から落とす
- 表記ゆれを統一する
- 同じ意味の URL を同じ形に寄せる

#### 3. アンチパターンとなるもの

middleware を validation の本体やビジネスロジックの置き場にしないことです。
検証は `validateSearch`、データ取得依存は `loaderDeps`、URL の正規化は `search.middlewares` と分けます。

---

### Topic B: `retainSearchParams`

#### 1. 公式ドキュメント通りのやり方

`retainSearchParams(['rootValue'])` のように指定し、現在の search に存在するキーを以降の Link 生成でも保持します。

```tsx
search: {
  middlewares: [retainSearchParams(['debug'])],
}
```

#### 2. 現場で使われるやり方

アプリ全体または route subtree 全体で意味がある値を保持する用途で使います。

- `debug`
- `lang`
- `workspaceId`
- `tenantId`
- 一時的な検証用 feature flag

#### 3. アンチパターンとなるもの

何でも retain することです。
意図しない search params が別画面まで伝播し、URL が読みにくくなり、共有リンクの意味も曖昧になります。

特に、個人 UI 設定・選択中 ID・入力途中フォーム・機密情報を retain するのは避けます。

---

### Topic C: `stripSearchParams`

#### 1. 公式ドキュメント通りのやり方

`stripSearchParams({ page: 1 })` のように指定し、デフォルト値と同じ search params を URL から削除します。

```tsx
const defaultValues = {
  page: 1,
  sort: 'name',
}

search: {
  middlewares: [stripSearchParams(defaultValues)],
}
```

#### 2. 現場で使われるやり方

一覧・検索画面の canonical URL を作るために使います。

- `page=1` を消す
- `sort=default` を消す
- `q=` のような空文字を消す
- 初期状態の URL を短くする

#### 3. アンチパターンとなるもの

`validateSearch` の default/fallback と `stripSearchParams` の defaultValues を別々に管理してズラすことです。
ズレると、画面上の state と URL の canonical 表現が食い違います。

---

### Topic D: custom middleware

#### 1. 公式ドキュメント通りのやり方

custom middleware は `search` を受け取り、`next(search)` の結果を返す前後で search params を変形します。

```tsx
search: {
  middlewares: [
    ({ search, next }) => {
      const result = next(search)
      return {
        ...result,
        debug: search.debug,
      }
    },
  ],
}
```

#### 2. 現場で使われるやり方

独自の正規化ルールをまとめる用途で使います。

- 古い param 名を新しい param 名に寄せる
- 大文字小文字を統一する
- `tags` 配列の重複を消す
- 順序に意味がない配列をソートして URL を安定させる

#### 3. アンチパターンとなるもの

順序に意味がある配列を勝手にソートすることです。
例えば `columns` の表示順や並び替え順に意味がある場合、middleware で正規化すると state の意味を壊します。

---

### Topic E: middleware と serializer の境界

#### 1. 公式ドキュメント通りのやり方

TanStack Router はデフォルトで `JSON.stringify` / `JSON.parse` ベースの JSON-first な search params を扱います。
必要に応じて `parseSearch` / `stringifySearch` を差し替えられます。

#### 2. 現場で使われるやり方

まずは middleware で URL を正規化し、それでも足りない場合に serializer の差し替えを検討します。

- URL が長すぎる
- 外部ツールとの互換性が必要
- 可読性より短さを優先したい
- 配列や object の表現を別形式にしたい

#### 3. アンチパターンとなるもの

serializer を先に変えることです。
可逆性が壊れると、共有リンク・戻る進む・loaderDeps の前提が壊れます。

---

## 2. ハンズオン

### Hands-on 1: `retainSearchParams` で `debug` を全 route に保持する

#### 1. 公式ドキュメント通りのやり方

`__root.tsx` に root-level の search schema と `retainSearchParams(['debug'])` を追加します。

観察すること:

- `?debug=true` を付けた状態で別 route へ Link 遷移しても `debug` が残る
- `debug` を指定しない Link でも、現在の search から保持される

#### 2. 現場で使われるやり方

デバッグ用 param や開発中 feature flag を route 横断で保持する用途です。
ただし機密情報やユーザー固有の一時状態には使いません。

#### 3. アンチパターンとなるもの

root に置いた search params を全画面で何となく読めるからといって、何でも root search に寄せることです。
root search は影響範囲が広いため、global に意味があるものだけにします。

---

### Hands-on 2: `stripSearchParams` で `page=1` を消す

#### 1. 公式ドキュメント通りのやり方

`/search` または `/echo` で `page` の default を `1` にし、`stripSearchParams({ page: 1 })` を追加します。

観察すること:

- `page=1` が URL から消える
- `page=2` は URL に残る
- `Route.useSearch()` では `page` が常に number として扱える

#### 2. 現場で使われるやり方

検索画面や一覧画面の URL を短く、安定した形に保つために使います。
共有リンクやテストケースの差分が小さくなります。

#### 3. アンチパターンとなるもの

UI 初期値、`validateSearch` の fallback、`stripSearchParams` の defaultValues がバラバラに定義されることです。
defaultValues は可能なら同じ定数から参照します。

---

### Hands-on 3: custom middleware で `tags` を正規化する

#### 1. 公式ドキュメント通りのやり方

`tags: string[]` を search schema に持たせ、middleware で重複排除とソートを行います。

観察すること:

- `tags=['b', 'a', 'a']` が `['a', 'b']` に寄る
- 同じ意味の URL が同じ表現になる
- `Route.useSearch()` では正規化後の値が取れる

#### 2. 現場で使われるやり方

タグ検索・チェックボックス filter のように、配列の順序に意味がない場合に使います。
URL が安定するので、共有・比較・テストが楽になります。

#### 3. アンチパターンとなるもの

順序に意味がある state を middleware で勝手に並び替えることです。
例えば `sortPriority` や `columns` には適用しません。

---

### Hands-on 4: middleware と `loaderDeps` の相互作用を見る

#### 1. 公式ドキュメント通りのやり方

`loaderDeps` には loader が実際に使う search params だけを入れます。
middleware によって URL が変形されても、loader が使わない値なら deps に含めないようにします。

観察すること:

- `debug` を retain しても loader が使わないなら `loaderDeps` に入れない
- `tags` を loader が使うなら `loaderDeps` に入れる
- `loaderDeps: ({ search }) => search` にすると、不要な reload が増える

#### 2. 現場で使われるやり方

URL は middleware で綺麗にしつつ、loaderDeps は最小にしてキャッシュキーを安定させます。
これにより「共有しやすい URL」と「無駄な fetch をしない」の両立ができます。

#### 3. アンチパターンとなるもの

`loaderDeps` に search 全体を渡すことです。
関係ない search params の変更でも loader が再実行され、キャッシュが細かく分裂します。

---

## 到達目標

- Search middleware の責務を `validateSearch` / `loaderDeps` / serializer と区別できる
- `retainSearchParams` を global/subtree state の保持に使える
- `stripSearchParams` で canonical URL を作れる
- custom middleware で意味を壊さず search params を正規化できる
- middleware と loader cache の関係を説明できる
