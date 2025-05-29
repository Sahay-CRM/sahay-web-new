export const baseUrl = import.meta.env.VITE_API_BASE;

const Urls = {
  loginSendOtp: () => `${baseUrl}/auth/login`,
  loginVerifyOtp: () => `${baseUrl}/verify-otp`,
  loginCompany: () => `${baseUrl}/auth/select-company`,

  getCountryList: () => `${baseUrl}/geography/country/get`,
  addCountry: () => `${baseUrl}/geography/country/create`,
  updateCountry: (id: string) => `${baseUrl}/geography/country/update/${id}`,
  deleteCountry: (id: string) => `${baseUrl}/geography/country/delete/${id}`,
  dropdownCountry: () => `${baseUrl}/geography/country/get-all`,

  getStateList: () => `${baseUrl}/geography/state/get`,
  addState: () => `${baseUrl}/geography/state/create`,
  updateState: (id: string) => `${baseUrl}/geography/state/update/${id}`,
  deleteState: (id: string) => `${baseUrl}/geography/state/delete/${id}`,
  dropdownState: () => `${baseUrl}/geography/state/get-all`,

  getCityList: () => `${baseUrl}/geography/city/get`,
  addCity: () => `${baseUrl}/geography/city/create`,
  updateCity: (id: string) => `${baseUrl}/geography/city/update/${id}`,
  deleteCity: (id: string) => `${baseUrl}/geography/city/delete/${id}`,
  dropdownCity: () => `${baseUrl}/geography/city/get-all`,
};

export default Urls;
