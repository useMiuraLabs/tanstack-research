import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "./types";
import { TOKEN_KEY } from "./api";

const USER_KEY = "auth_user";

type AuthState = {
  token: string | null;
  user: User | null;
};

export type AuthContextValue = AuthState & {
  isAuthenticated: boolean;
  setSession: (session: Session) => void;
  clearSession: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const readInitial = (): AuthState => {
  const token = localStorage.getItem(TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);
  return {
    token,
    user: userRaw ? (JSON.parse(userRaw) as User) : null,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(readInitial);

  const setSession = useCallback(({ token, user }: Session) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setState({ token, user });
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ token: null, user: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAuthenticated: state.token !== null,
        setSession,
        clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
