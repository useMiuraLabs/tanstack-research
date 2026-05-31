export type Product = {
  id: string;
  name: string;
  stock: number;
  fetchedAt: string;
};

export async function fetchProduct(id: string): Promise<Product> {
  await new Promise((r) => setTimeout(r, 500));
  return {
    id,
    name: `Product ${id}`,
    stock: Math.floor(Math.random() * 100),
    fetchedAt: new Date().toISOString(),
  };
}

export type Post = {
  id: string;
  title: string;
  body: string;
};

const POSTS: Record<string, Post> = {
  "1": { id: "1", title: "TanStack Router 入門", body: "型安全なルーティングの基本..." },
  "2": { id: "2", title: "Search Params の哲学", body: "URL を状態管理に使う..." },
  "3": { id: "3", title: "Loader と Suspense", body: "データ取得の宣言的アプローチ..." },
};

export async function fetchPost(id: string): Promise<Post | null> {
  await new Promise((r) => setTimeout(r, 300));
  return POSTS[id] ?? null;
}

export async function fetchPosts(): Promise<Array<Pick<Post, "id" | "title">>> {
  await new Promise((r) => setTimeout(r, 300));
  return Object.values(POSTS).map(({ id, title }) => ({ id, title }));
}

export type Product2 = {
  id: string;
  name: string;
  category: "book" | "food" | "gadget";
  price: number;
  inStock: boolean;
};

const ALL_PRODUCTS: Array<Product2> = [
  { id: "p01", name: "TanStack Router 完全ガイド", category: "book", price: 3200, inStock: true },
  { id: "p02", name: "React 設計パターン", category: "book", price: 2800, inStock: false },
  { id: "p03", name: "TypeScript 型の魔術", category: "book", price: 3600, inStock: true },
  { id: "p04", name: "抹茶ようかん", category: "food", price: 480, inStock: true },
  { id: "p05", name: "熊本産りんご 5kg", category: "food", price: 2400, inStock: true },
  { id: "p06", name: "極上カレールー", category: "food", price: 680, inStock: false },
  { id: "p07", name: "メカニカルキーボード", category: "gadget", price: 18000, inStock: true },
  {
    id: "p08",
    name: "ノイズキャンセリングイヤホン",
    category: "gadget",
    price: 24000,
    inStock: false,
  },
  { id: "p09", name: "4K モニタ 27 インチ", category: "gadget", price: 52000, inStock: true },
  { id: "p10", name: "USB-C ハブ", category: "gadget", price: 4800, inStock: true },
];

export type SearchProductsParams = {
  q: string;
  category: "book" | "food" | "gadget" | "all";
  sort: "name" | "price-asc" | "price-desc";
  page: number;
  perPage: number;
  inStockOnly: boolean;
};

export async function searchProducts(params: SearchProductsParams): Promise<{
  items: Array<Product2>;
  total: number;
  page: number;
  totalPages: number;
}> {
  await new Promise((r) => setTimeout(r, 200));

  const q = params.q.trim().toLowerCase();
  let filtered = ALL_PRODUCTS.filter((p) => {
    if (params.category !== "all" && p.category !== params.category) return false;
    if (params.inStockOnly && !p.inStock) return false;
    if (q && !p.name.toLowerCase().includes(q)) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (params.sort === "name") return a.name.localeCompare(b.name, "ja");
    if (params.sort === "price-asc") return a.price - b.price;
    return b.price - a.price;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / params.perPage));
  const page = Math.min(Math.max(1, params.page), totalPages);
  const start = (page - 1) * params.perPage;
  const items = filtered.slice(start, start + params.perPage);

  return { items, total, page, totalPages };
}
