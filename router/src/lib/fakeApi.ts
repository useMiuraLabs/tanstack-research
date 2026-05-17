export type Product = {
  id: string
  name: string
  stock: number
  fetchedAt: string
}

export async function fetchProduct(id: string): Promise<Product> {
  await new Promise((r) => setTimeout(r, 500))
  return {
    id,
    name: `Product ${id}`,
    stock: Math.floor(Math.random() * 100),
    fetchedAt: new Date().toISOString(),
  }
}

export type Post = {
  id: string
  title: string
  body: string
}

const POSTS: Record<string, Post> = {
  '1': { id: '1', title: 'TanStack Router 入門', body: '型安全なルーティングの基本...' },
  '2': { id: '2', title: 'Search Params の哲学', body: 'URL を状態管理に使う...' },
  '3': { id: '3', title: 'Loader と Suspense', body: 'データ取得の宣言的アプローチ...' },
}

export async function fetchPost(id: string): Promise<Post | null> {
  await new Promise((r) => setTimeout(r, 300))
  return POSTS[id] ?? null
}

export async function fetchPosts(): Promise<Array<Pick<Post, 'id' | 'title'>>> {
  await new Promise((r) => setTimeout(r, 300))
  return Object.values(POSTS).map(({ id, title }) => ({ id, title }))
}
