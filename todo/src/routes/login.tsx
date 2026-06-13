import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

type Auth = {
  email: string;
  pass: string;
  name: string;
};
function RouteComponent() {
  const [auth, setAuth] = useState<Auth>({ email: "", pass: "", name: "" });
  const [error, setError] = useState(0);
  // const nav = Route.useNavigate();
  const onSub: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const api = "/api/auth/sign-in/email";
    try {
      const res = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: auth.email,
          password: auth.pass,
          name: "ssss",
        }),
      });
      const error = await res.text();
      console.log(res, error);
      if (!res.ok) setError(res.status);
    } catch (error) {}

    // nav({ to: "/todo" });
  };
  return (
    <form className="m-5" onSubmit={onSub}>
      <div>
        <p>email</p>
        <input
          type="email"
          className="outline"
          value={auth.email}
          onChange={(e) => setAuth({ ...auth, email: e.target.value })}
        />
      </div>
      <div>
        <p>pass</p>
        <input
          type="password"
          className="outline"
          value={auth.pass}
          onChange={(e) =>
            setAuth({ ...auth, email: auth.email, pass: e.target.value })
          }
        />
      </div>
      <button type="submit">login</button>
      <p>{error}</p>
    </form>
  );
}
