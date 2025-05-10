const baseUrl = import.meta.env.VITE_API_BASE;

const Urls = {
  loginSendOtp: () => `${baseUrl}/auth/login`,
  loginVerifyOtp: () => `${baseUrl}/verify-otp`,
};

export default Urls;
