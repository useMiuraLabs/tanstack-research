import * as v from "valibot";
export type Auth = {
  name: string;
  email: string;
  pass: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
};

export type Session = {
  token: string;
  user: User;
};

export const authSchema = v.object({
  token: v.string('token ぶっ壊れている'),
  user: v.object({
    id: v.string('id  ぶっ壊れている'),
    name: v.string('name  ぶっ壊れている'),
    email: v.string('email  ぶっ壊れている'),
  }),
});
