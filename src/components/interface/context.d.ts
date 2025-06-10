interface AuthContextType {
  isAuthenticated: boolean;
  appLoading: boolean;
  setToken: (token: string, user?: User | null) => void;
  clearToken: () => void;
  user: User | null;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: User | null;
  token: string | null;
  userPermission?: PermissionsResponse;
  kpiData?: KpiData;
  userId?: string;
}

interface CustomError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface RootState {
  auth: AuthState;
}
