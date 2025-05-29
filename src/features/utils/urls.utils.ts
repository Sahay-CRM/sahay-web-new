export const baseUrl = import.meta.env.VITE_API_BASE;

const Urls = {
  loginSendOtp: () => `${baseUrl}/auth/login`,
  loginVerifyOtp: () => `${baseUrl}/auth/verify-otp`,
  loginCompany: () => `${baseUrl}/auth/select-company`,
  getUserPermission: (id: string) =>
    `${baseUrl}/admin/user-permission/get/${id}`,
  CompanyTask: () => `${baseUrl}/company/tasks/employee`,

  getAllModuleList: () => `${baseUrl}/module/get-all`,
  getAllPermissionList: () => `${baseUrl}/permission/get`,

  updateUserPermission: (id: string) =>
    `${baseUrl}/admin/user-permission/update/${id}`,
  userPermissionById: (id: string) =>
    `${baseUrl}/admin/user-permission/get/${id}`,
};

export default Urls;
