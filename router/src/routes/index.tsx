import { Link, createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="mx-auto max-w-5xl p-8">
      <header className="border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-bold">TanStack Router 学習 Index</h1>
        <p className="mt-2 text-gray-600">
          Topic ごとに分類した実験ページの入口。 各カードの説明は「この
          route が何を体感させるためにあるか」を一行で書いてあります。
        </p>
      </header>

      <Section title="基礎ナビゲーション" description="Link / Outlet / ネスト route の基本">
        <Card to="/about" label="About" hint="単一の静的 route" />
        <Card to="/posts" label="Posts" hint="ネスト route と一覧 → 詳細の遷移" />
        <Card
          to="/products/fresh"
          label="Products"
          hint="loader / staleTime / preload の挙動比較"
        />
      </Section>

      <Section
        title="Search Params"
        description="validateSearch による型付き search param"
      >
        <Card
          to="/search"
          search={{
            q: "",
            category: "all",
            sort: "name",
            page: 1,
            perPage: 10,
            inStockOnly: false,
          }}
          label="Search"
          hint="zod スキーマで search param を validate"
        />
        <Card
          to="/echo"
          search={{
            q: "",
            pageCatch: 1,
            pageDefault: 1,
            debug: "",
            tags: [],
            sort: "ASC",
            ui: "grid",
          }}
          label="Echo"
          hint="catch / default / array など search param のバリエーション"
        />
      </Section>

      <Section
        title="Auth: 単発 guard と unknown 状態"
        description="beforeLoad の基礎と unknown 状態のアンチパターン"
      >
        <Card
          to="/auth"
          label="Auth check"
          hint="単発 guard。未認証なら Echo に redirect"
        />
        <Card
          to="/auth-lab/unknown-return"
          label="Auth unknown return"
          hint="unknown を return で通すアンチパターン"
          warn
        />
        <Card
          to="/auth-lab/wait"
          label="Auth wait"
          hint="waitForReady() を await して判定完了まで待つ"
        />
      </Section>

      <Section
        title="Login flow"
        description="redirect search param で元の URL に戻す"
      >
        <Card
          to="/login"
          search={{ redirect: "/app/dashboard" }}
          label="Login → /app/dashboard"
          hint="ログイン後に dashboard へ戻る基本フロー"
        />
        <Card
          to="/login"
          search={{ redirect: "/app/admin" }}
          label="Login → /app/admin"
          hint="child guard を試すための入口"
        />
      </Section>

      <Section
        title="Topic G: URL-visible Layout Route (/app)"
        description="親 /app で認証 guard、子で role guard。URL に /app が出る流儀"
      >
        <Card
          to="/app/dashboard"
          label="/app/dashboard"
          hint="親 /app の beforeLoad で認証 guard"
        />
        <Card
          to="/app/admin"
          label="/app/admin"
          hint="子 route で role === 'admin' を判定。失敗で /403"
        />
      </Section>

      <Section
        title="Navigation Blocking"
        description="from 側からの退場交渉。未保存フォーム離脱阻止"
      >
        <Card
          to="/nav-lab/dirty-form"
          label="/nav-lab/dirty-form"
          hint="useBlocker の withResolver false/true を並べて体感"
        />
      </Section>

      <Section
        title="Pathless Layout Route (_authenticated)"
        description="同じ guard を URL に出さずに当てる流儀"
      >
        <Card
          to="/profile"
          label="/profile"
          hint="_authenticated.profile.tsx。URL に _authenticated は出ない"
        />
        <Card
          to="/settings"
          label="/settings"
          hint="同じ pathless layout を共有する別 route"
        />
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

type CardProps = {
  to: string;
  label: string;
  hint: string;
  warn?: boolean;
  search?: Record<string, unknown>;
};

function Card({ to, label, hint, warn, search }: CardProps) {
  const base =
    "block rounded border p-3 transition hover:border-blue-500 hover:bg-blue-50";
  const tone = warn
    ? "border-amber-300 bg-amber-50"
    : "border-gray-200 bg-white";

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Link to={to as any} search={search as any} className={`${base} ${tone}`}>
      <div className="font-mono text-sm font-semibold text-blue-700">
        {label}
      </div>
      <div className="mt-1 text-xs text-gray-600">{hint}</div>
    </Link>
  );
}
