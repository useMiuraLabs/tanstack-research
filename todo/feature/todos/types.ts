import * as v from "valibot";
export const todoSchema = v.object({
  id: v.string(),
  title: v.string(),
  description: v.nullable(v.string()),
  done: v.boolean(),
});

export const todoListSchema = v.object({
  items: v.array(todoSchema),
  nextCursor: v.nullable(v.string()),
});
