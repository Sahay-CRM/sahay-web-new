interface Login {
  mobile: string;
  userType: string;
  otp?: string;
}
interface SendOtp {
  mobile: string;
  userType: string;
}

interface LoginResponse {
  message: string;
  status: boolean;
}

interface VerifyOtp {
  mobile: string;
  userType: string;
  otp?: string;
}
