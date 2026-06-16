import { useState } from "react";
import { authFetch } from "../../../auth/api";

type TodoForm = {
  title: string;
  description?: string;
  due?: string;
};

export const NewTodoForm = () => {
  const [todoForm, setTodoForm] = useState<TodoForm>({ title: "" });

  const onSubmit = async () => {
    try {
      const res = await authFetch("/api/todos", {
        method: "POST",
        body: JSON.stringify({
          title: todoForm.title,
          description: todoForm.description,
          due: todoForm.due,
        }),
      });

      if (!res.ok) {
        console.log(res.json.toString);
      }

      const resTxt = await res.text();
      console.log("res: ", resTxt);
    } catch (error) {
      console.log("ERROR", error);
    }
  };
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit();
      }}
    >
      <div>
        <p>タイトル</p>
        <input
          type="text"
          value={todoForm.title}
          onChange={(e) => setTodoForm({ ...todoForm, title: e.target.value })}
        />
      </div>
      <div>
        <p>詳細</p>
        <input
          type="text"
          value={todoForm.description}
          onChange={(e) =>
            setTodoForm({ ...todoForm, description: e.target.value })
          }
        />
      </div>
      <div>
        <p>期限</p>
        <input
          type="date"
          value={todoForm.due}
          onChange={(e) => setTodoForm({ ...todoForm, due: e.target.value })}
        />
      </div>
      <button type="submit">作成</button>
      {todoForm.title}
      {todoForm.description ? todoForm.description : "詳細なし"}
      {todoForm.due}
    </form>
  );
};
