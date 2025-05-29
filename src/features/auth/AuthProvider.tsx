import { useCallback, useEffect, useMemo, useState, ReactNode } from "react";
import { AuthContext, AuthContextType } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
  }>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem("s-authToken");
        const storedUser = localStorage.getItem("USER_DATA");
        // console.log(storedToken, "<==storedToken");
        // console.log(storedUser, "<==storedUser");

        if (storedToken) {
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: storedUser ? JSON.parse(storedUser) : null,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
          });
        }
      } catch {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    };

    initializeAuth();
  }, []);

  const setToken = useCallback((token: string, user: User | null = null) => {
    try {
      localStorage.setItem("s-authToken", token);
      if (user) {
        localStorage.setItem("USER_DATA", JSON.stringify(user));
      }
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
      });
    } catch {
      // console.error("Something went wrong while setting the token");
    }
  }, []);

  const clearToken = useCallback(() => {
    try {
      localStorage.removeItem("s-authToken");
      localStorage.removeItem("USER_DATA");
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    } catch {
      // const err = error as { response?: { data?: { message?: string } } };
      // const message = err?.response?.data?.message || "Something went wrong!";
      // console.error(message, "error");
    }
  }, []);

  const memorizeValue = useMemo<AuthContextType>(() => {
    return {
      isAuthenticated: authState.isAuthenticated,
      appLoading: authState.isLoading,
      setToken,
      clearToken,
      user: authState.user,
    };
  }, [authState, setToken, clearToken]);

  return (
    <AuthContext.Provider value={memorizeValue}>
      {children}
    </AuthContext.Provider>
  );
}
