import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "../../feature/auth/components/LoginForm";
import { SignUpForm } from "../../feature/auth/components/SignUpForm";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="m-5 flex flex-col gap-8 md:flex-row">
      <LoginForm />
      <div className="hidden w-px bg-gray-300 md:block" />
      <SignUpForm />
    </div>
  );
}
