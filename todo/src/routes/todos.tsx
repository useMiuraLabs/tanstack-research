import * as v from "valibot";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { NewTodoForm } from "../../feature/todos/components/form/NewTodoForm";
import { authFetch } from "../../feature/auth/api";
import { todoListSchema } from "../../feature/todos/types";

export const Route = createFileRoute("/todos")({
  beforeLoad: ({ context }) => {
    console.log(context.auth.user);
    if (!context.auth.user) {
      throw redirect({ to: "/login" });
    }
  },
  loader: async () => {
    try {
      const res = await authFetch("/api/todos");
      const validatedRes = v.parse(todoListSchema, await res.json());
      // const resJson = await res.json();
      console.log("TODOLIST res", validatedRes);
      return validatedRes;
    } catch (error) {
      console.log("ERROR", error);
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const context = Route.useRouteContext();
  const todos = Route.useLoaderData();
  return (
    <div>
      <div>user:{context.auth.user?.name}</div>
      <NewTodoForm />
      {todos?.items.map((i) => {
        return (
          <div className="outline m-5">
            <p>タイトル:{i.title}</p>
            <p>詳細:{i.description}</p>
            <input type="checkbox" checked={i.done} />
          </div>
        );
      })}
    </div>
  );
}
