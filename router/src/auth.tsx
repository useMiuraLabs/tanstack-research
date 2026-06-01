export type AuthState =
  | { status: "unknown" }
  | { status: "anonymous" }
  | { status: "authenticated" };

type ReadyAuthState = Exclude<AuthState, { status: "unknown" }>;

export type AuthContext = {
  state: AuthState;
  waitForReady: () => Promise<ReadyAuthState>;
};

const anonymousAuthState: ReadyAuthState = {
  status: "anonymous",
};

export const initialAuthContext: AuthContext = {
  state: { status: "unknown" },
  waitForReady: () =>
    new Promise((resolve) => {
      setTimeout(() => resolve(anonymousAuthState), 1_200);
    }),
};
