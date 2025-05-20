import { createContext } from "react";

export interface AuthContextType {
  isAuthenticated: boolean;
  appLoading: boolean;
  setToken: (token: string, user?: User | null) => void;
  clearToken: () => void;
  user: User | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
