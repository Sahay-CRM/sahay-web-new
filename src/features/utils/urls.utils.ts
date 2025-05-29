export const baseUrl = import.meta.env.VITE_API_BASE;

const Urls = {
  loginSendOtp: () => `${baseUrl}/auth/login`,
  loginVerifyOtp: () => `${baseUrl}/verify-otp`,
  loginCompany: () => `${baseUrl}/auth/select-company`,
};

export default Urls;
