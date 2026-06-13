import { useState } from "react";
import {
  Link,
  createFileRoute,
  useBlocker,
} from "@tanstack/react-router";

export const Route = createFileRoute("/nav-lab/dirty-form")({
  component: DirtyFormPage,
});

function DirtyFormPage() {
  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold">Navigation Blocking lab</h1>
      <p className="mt-2 text-gray-600">
        フォームに何か入力すると dirty 状態になります。 その状態で他の
        route に遷移しようとすると、navigation が止まります。
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <ConfirmBlocker />
        <CustomUIBlocker />
      </div>

      <div className="mt-8 rounded border border-gray-200 p-4">
        <h2 className="text-lg font-semibold">脱出用リンク</h2>
        <p className="mt-1 text-sm text-gray-600">
          dirty 状態のままここをクリックすると blocker が発火します。
        </p>
        <nav className="mt-3 flex gap-3">
          <Link to="/" className="text-blue-600 underline">
            Home
          </Link>
          <Link to="/about" className="text-blue-600 underline">
            About
          </Link>
        </nav>
      </div>
    </section>
  );
}

function ConfirmBlocker() {
  const [value, setValue] = useState("");
  const isDirty = value.length > 0;

  useBlocker({
    shouldBlockFn: () => {
      if (!isDirty) return false;
      const shouldLeave = window.confirm("変更があります。離脱しますか？");
      return !shouldLeave;
    },
    enableBeforeUnload: isDirty,
  });

  return (
    <article className="rounded border border-gray-200 p-4">
      <h2 className="text-lg font-semibold">withResolver: false</h2>
      <p className="mt-1 text-sm text-gray-600">
        <code>shouldBlockFn</code> 内で <code>window.confirm</code> を呼ぶ。
        戻り値で判定が確定する素朴なパターン。
      </p>
      <label className="mt-3 block">
        <span className="text-sm font-semibold">入力</span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
          placeholder="何か入力すると dirty 状態に"
        />
      </label>
      <p className="mt-2 text-xs text-gray-500">
        現在の状態: {isDirty ? "dirty" : "clean"}
      </p>
    </article>
  );
}

function CustomUIBlocker() {
  const [value, setValue] = useState("");
  const isDirty = value.length > 0;

  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => isDirty,
    withResolver: true,
    enableBeforeUnload: isDirty,
  });

  return (
    <article className="rounded border border-gray-200 p-4">
      <h2 className="text-lg font-semibold">withResolver: true</h2>
      <p className="mt-1 text-sm text-gray-600">
        判定だけ <code>shouldBlockFn</code> で行い、 確定は{" "}
        <code>proceed()</code> / <code>reset()</code> で行う。 カスタム UI 用。
      </p>
      <label className="mt-3 block">
        <span className="text-sm font-semibold">入力</span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
          placeholder="何か入力すると dirty 状態に"
        />
      </label>
      <p className="mt-2 text-xs text-gray-500">
        現在の状態: {isDirty ? "dirty" : "clean"} / blocker status: {status}
      </p>

      {status === "blocked" && (
        <div className="mt-4 rounded border border-amber-300 bg-amber-50 p-3">
          <p className="text-sm font-semibold text-amber-900">
            離脱しようとしています
          </p>
          <p className="mt-1 text-xs text-amber-900">
            入力中の内容は失われます。続行しますか？
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={proceed}
              className="rounded bg-amber-700 px-3 py-1 text-sm font-semibold text-white"
            >
              続行する
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded border border-amber-400 px-3 py-1 text-sm font-semibold"
            >
              戻る
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
