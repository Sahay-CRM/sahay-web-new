interface User {
  token: string;
  key: string;
  adminUserName?: string;
  adminUserId?: string;
  adminUserEmail?: string;
  employeeId?: string;
  employeeName?: string;
  consultantId?: string;
  consultantName?: string;
  consultantMobile?: string;
  consultantEmail?: string;
  companyId?: string;
  companyCount?: string;
  companyName?: string;
  role?: string;
  photo?: string;
  pancard?: string;
  isSuperAdmin?: string;
}

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
  user: User | null;
}

interface CustomError {
  response?: {
    data?: {
      message?: string;
    };
  };
}
