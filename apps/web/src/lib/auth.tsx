"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { apiGet, setOnUnauthorized } from "./api";

export type AuthUser = {
  customerId: string;
  userId: string;
  email: string;
};

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: AuthUser };

const AuthContext = createContext<{
  auth: AuthState;
  refetch: () => Promise<void>;
  clearAuth: () => void;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  const refetch = useCallback(async () => {
    const res = await apiGet<AuthUser>("/auth/me");
    if (res.ok) {
      setAuth({ status: "authenticated", user: res.data });
    } else {
      setAuth({ status: "unauthenticated" });
    }
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      setAuth({ status: "unauthenticated" });
      router.replace("/login");
    });
    return () => setOnUnauthorized(null);
  }, [router]);

  const clearAuth = useCallback(() => {
    setAuth({ status: "unauthenticated" });
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <AuthContext.Provider value={{ auth, refetch, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
