import { createContext, useContext, useMemo, useState } from "react";

import { clearAccessToken, getAccessToken, setAccessToken } from "../auth/tokenStorage";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getAccessToken());

  const setToken = (nextToken: string | null) => {
    setTokenState(nextToken);
    if (nextToken) {
      setAccessToken(nextToken);
      return;
    }
    clearAccessToken();
  };

  const logout = () => setToken(null);

  const value = useMemo(
    () => ({ token, isAuthenticated: Boolean(token), setToken, logout }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
