export interface PermissionsResponse {
  [key: string]: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  adminUserId?: string;
  employeeId?: string;
}

export interface LoginResponse {
  status: boolean;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}

export interface CompanyResponse {
  status: boolean;
  message?: string;
  data: User[];
}

export interface SendOtp {
  mobile: string;
  userType: string;
}

export interface VerifyOtp {
  mobile: string;
  otp: string;
  userType: string;
}

export interface CompanyLogin {
  companyId: string;
  mobile: string;
}

export interface Login {
  mobile: string;
  userType: string;
  otp?: string;
} 