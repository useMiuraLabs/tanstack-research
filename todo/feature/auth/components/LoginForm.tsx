import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AuthForm } from "./AuthForm";
import { authSchema, type Auth } from "../types";
import { useAuth } from "../AuthProvider";
import * as v from "valibot";

export const LoginForm = () => {
  const { setSession } = useAuth();
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

      const validatedRes = v.parse(authSchema, await res.json());
      console.log("res", validatedRes);

      setSession({
        token: validatedRes.token,
        user: {
          id: validatedRes.user.id,
          email: validatedRes.user.email,
          name: validatedRes.user.name,
        },
      });

      // nav({ to: "/todo" });
    } catch (e) {
      console.log(e);
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
