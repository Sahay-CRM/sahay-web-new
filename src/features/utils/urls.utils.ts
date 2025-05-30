export const baseUrl = import.meta.env.VITE_API_BASE;

const Urls = {
  loginSendOtp: () => `${baseUrl}/auth/login`,
  loginVerifyOtp: () => `${baseUrl}/auth/verify-otp`,
  loginCompany: () => `${baseUrl}/auth/select-company`,
  getUserPermission: (id: string) =>
    `${baseUrl}/admin/user-permission/get/${id}`,
  CompanyTask: () => `${baseUrl}/company/tasks/employee`,

  dropdownDepartment: () => `${baseUrl}/department/get-all`,
  //designation
  getDesignationList: () => `${baseUrl}/company/designation/get`,
  deletedesignation: (id: string) =>
    `${baseUrl}/company/designation/delete/${id}`,
  updateDesignation: (id: string) =>
    `${baseUrl}/company/designation/update/${id}`,
  addDesignation: () => `${baseUrl}/company/designation/create`,
  dropdownDesignation: () => `${baseUrl}/company/designation/get-all`,

  //employee
  getEmployeeList: () => `${baseUrl}/company/employee/get`,
  addEmployee: () => `${baseUrl}/company/employee/create`,
  updateEmployee: (id: string) => `${baseUrl}/company/employee/update/${id}`,
};

export default Urls;
