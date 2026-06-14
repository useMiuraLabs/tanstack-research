import { useState } from "react";
import type { Auth } from "../types";

type AuthFormProps = {
  onSubmit: (auth: Auth) => Promise<void>;
  error: string;
  submitLabel: string;
  withName?: boolean;
};

export const AuthForm = ({
  onSubmit,
  error,
  submitLabel,
  withName = false,
}: AuthFormProps) => {
  const [auth, setAuth] = useState<Auth>({ name: "", email: "", pass: "" });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit(auth);
      }}
    >
      {withName && (
        <label className="block">
          <p>name</p>
          <input
            type="text"
            className="outline"
            value={auth.name}
            onChange={(e) => setAuth({ ...auth, name: e.target.value })}
          />
        </label>
      )}
      <label className="block">
        <p>email</p>
        <input
          type="email"
          className="outline"
          value={auth.email}
          onChange={(e) => setAuth({ ...auth, email: e.target.value })}
        />
      </label>
      <label className="block">
        <p>pass</p>
        <input
          type="password"
          className="outline"
          value={auth.pass}
          onChange={(e) => setAuth({ ...auth, pass: e.target.value })}
        />
      </label>
      <button type="submit" className="w-fit border px-3 py-1">
        {submitLabel}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
};
