"use client";

import { createContext, useContext } from "react";
import type { AuthStatus } from "../lib/auth/session";
import type { AuthApiError, AuthUser } from "../lib/auth/types";

export type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  error: AuthApiError | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  clearLocalSession: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
