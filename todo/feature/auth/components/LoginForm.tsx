import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AuthForm } from "./AuthForm";
import type { Auth } from "../types";

export const LoginForm = () => {
  const [error, setError] = useState("");
  const nav = useNavigate();

  const onSubmit = async (auth: Auth) => {
    setError("");
    try {
      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: auth.email,
          password: auth.pass,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        setError(`login failed: ${res.status} ${body}`);
        return;
      }
      nav({ to: "/todo" });
    } catch {
      setError("通信エラー");
    }
  };

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl font-bold">Login</h2>
      <AuthForm onSubmit={onSubmit} error={error} submitLabel="login" />
    </section>
  );
};
