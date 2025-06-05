interface Login {
  mobile: string;
  userType: string;
  otp?: string;
}
interface SendOtp {
  mobile: string;
}

interface LoginResponse {
  message: string;
  status: boolean;
}

interface VerifyOtp {
  mobile: string;
  otp?: string;
}

interface SwitchCompanyType {
  selectedCompanyId: string;
  mobile: string;
  userType?: string;
}

interface VerifyOtpResponse {
  status: boolean;
  message?: string;
  data: User;
}

interface VerifyCompanyOtp {
  mobile: string;
  userType: string;
  companyId: string;
  consultantId: string;
}

interface VerifyCompanyOtpResponse {
  status: boolean;
  message?: string;
  user: User;
}
interface CompanyLogin {
  companyId: string;
  consultantId: string;
  companyName: string;
  mobile: string;
  userType: string;
}
interface Company {
  companyId: string;
  consultantId: string;
  companyName: string;
  mobile?: string;
  userType?: string;
  isReload?: boolean;
  employeeId?: string;
  employeeName?: string;
  employeeEmail?: string;
  isSahayEmployee?: boolean;
}
