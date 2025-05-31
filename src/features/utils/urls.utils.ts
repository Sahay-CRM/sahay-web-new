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

  getAllImportantDates: () => `${baseUrl}/company/imp-date/get-all`,
  addImportantDates: () => `${baseUrl}/company/imp-date/create`,
  updateImportantDates: (id: string) =>
    `${baseUrl}/company/imp-date/update/${id}`,
  deleteImportantDates: (id: string) =>
    `${baseUrl}/company/imp-date/delete/${id}`,
  getAllImportantDatesByPage: () => `${baseUrl}/company/imp-date/get`,

  getAllMeetingStatus: () => `${baseUrl}/meeting-status/get`,
  getAllMeetingType: () => `${baseUrl}/meeting-type/get`,

  getAllCompanyMeeting: () => `${baseUrl}/company/meeting/get-all`,
  addCompanyMeeting: () => `${baseUrl}/company/meeting/create`,
  updateCompanyMeeting: (id: string) =>
    `${baseUrl}/company/meeting/update/${id}`,
  deleteCompanyMeeting: (id: string) =>
    `${baseUrl}/company/meeting/delete/${id}`,
  getCompanyMeetingById: (id: string) => `${baseUrl}/company/meeting/get/${id}`,
  getAllCompanyMeetingByPage: () => `${baseUrl}/company/meeting/get`,

  getAllCompanyProject: () => `${baseUrl}/company/project/get-all`,
  addCompanyProject: () => `${baseUrl}/company/project/create`,
  updateCompanyProject: (id: string) =>
    `${baseUrl}/company/project/update/${id}`,
  deleteCompanyProject: (id: string) =>
    `${baseUrl}/company/project/delete/${id}`,
  getCompanyProjectById: (id: string) => `${baseUrl}/company/project/get/${id}`,
  getAllCompanyProjectByPage: () => `${baseUrl}/company/project/get`,
  getAllCorParameter: () => `${baseUrl}/core-param/get`,
  getAllSubParameter: () => `${baseUrl}/sub-param/get`,
  getAllProjectStatus: () => `${baseUrl}/project-status/get`,
  getAllDropdownProjectStatus: () => `${baseUrl}/project-status/get-all`,

  getAllCompanyTask: () => `${baseUrl}/company/task/get-all`,
  addCompanyTask: () => `${baseUrl}/company/task/create`,
  updateCompanyTask: (id: string) => `${baseUrl}/company/task/update/${id}`,
  deleteCompanyTask: (id: string) => `${baseUrl}/company/task/delete/${id}`,
  getCompanyTaskById: (id: string) => `${baseUrl}/company/task/get/${id}`,
  getAllCompanyTaskByPage: () => `${baseUrl}/company/task/get`,
  dropdownDepartment: () => `${baseUrl}/department/get-all`,
  getDepartmentList: () => `${baseUrl}/department/get`,
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
  getEmployeeById: (id: string) => `${baseUrl}/company/employee/get/${id}`,
  addEmployee: () => `${baseUrl}/company/employee/create`,
  updateEmployee: (id: string) => `${baseUrl}/company/employee/update/${id}`,
  deleteEmployee: (id: string) => `${baseUrl}/company/employee/delete/${id}`,
};

export default Urls;
