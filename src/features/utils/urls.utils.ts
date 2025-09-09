export const baseUrl = import.meta.env.VITE_API_BASE;

export const ImageBaseURL = import.meta.env.VITE_FILE_BASE_URL;

const Urls = {
  loginSendOtp: () => `${baseUrl}/auth/login`,
  loginVerifyOtp: () => `${baseUrl}/auth/verify-otp`,
  loginCompany: () => `${baseUrl}/auth/select-company`,
  getUserPermission: (id: string) =>
    `${baseUrl}/admin/user-permission/get/${id}`,
  CompanyTask: () => `${baseUrl}/company/tasks/employee`,

  getAllModuleList: () => `${baseUrl}/module/get-all-company`,
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
  ddMeetingStatus: () => `${baseUrl}/meeting-status/get-all`,
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

  getAllCompanyProjectDropdown: () => `${baseUrl}/company/project/get-all`,
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

  dropdownCoreParameter: () => `${baseUrl}/core-param/get-all`,

  dropdownSubParameter: () => `${baseUrl}/sub-param/get-all`,
  ddLevelsListAll: () => `${baseUrl}/level/get-all`,

  getAllCompanyLevel: (id: string) => `${baseUrl}/level/company/get/${id}`,

  updateComLevelsAssign: (id: string) =>
    `${baseUrl}/level/company/update/${id}`,

  updateHealthScore: () => `${baseUrl}/company/health/score/update`,
  getHealthScoreByParam: () => `${baseUrl}/company/health/score/sub-param`,

  getAllTaskTypeStatus: () => `${baseUrl}/task-status/get-all`,

  AllTaskTypeList: () => `${baseUrl}/task-type/get`,
  ddTaskType: () => `${baseUrl}/task-type/get-all`,
  getCompanyLevelByCore: () => `${baseUrl}/company/health/weightage/level`,
  getSubParaByCorePara: () => `${baseUrl}/company/health/weightage/sub-param`,

  updateHealthWeightage: () => `${baseUrl}/company/health/weightage/update`,
  //Datapoint
  getDatapointList: () => `${baseUrl}/company/kpi/get`,
  ddAllDatapointList: () => `${baseUrl}/company/kpi/get-all`,

  getKpinonselectList: () => `${baseUrl}/kpi/get/non-select`,
  updateCompanyDatapoint: (id: string) => `${baseUrl}/company/kpi/update/${id}`,
  addCompanyDatapoint: () => `${baseUrl}/company/kpi/create`,
  getKpiById: (id: string) => `${baseUrl}/company/kpi/get/${id}`,
  deleteDatapointMeeting: (id: string) => `${baseUrl}/company/kpi/delete/${id}`,
  deleteDatapointForce: (id: string) =>
    `${baseUrl}/company/kpi/delete-force/${id}`, // added

  //CoreParameter
  getCoreParameter: () => `${baseUrl}/core-param/get`,

  updateBrand: (id: string) => `${baseUrl}/company/brand/update/${id}`,
  addBrand: () => `${baseUrl}/company/brand/create`,
  getBrandList: () => `${baseUrl}/company/brand/get`,
  gelAllBrand: () => `${baseUrl}/company/brand/get-all`,
  brandDeleteById: (id: string) => `${baseUrl}/company/brand/delete/${id}`,

  updateProduct: (id: string) => `${baseUrl}/company/product/update/${id}`,
  addProduct: () => `${baseUrl}/company/product/create`,
  getProductList: () => `${baseUrl}/company/product/get`,
  productDeleteById: (id: string) => `${baseUrl}/company/product/delete/${id}`,
  gelAllProduct: () => `${baseUrl}/company/product/get-all`,

  uploadDoc: () => `${baseUrl}/file/upload-docs`,

  subParameterByFilter: () => `${baseUrl}/sub-param/get-by-level`,

  kpiStructureGet: () => `${baseUrl}/company/kpi-data/frame`,
  kpiDataGet: () => `${baseUrl}/company/kpi-data/get`,
  addUpdateKpi: () => `${baseUrl}/company/kpi-data/update`,
  getKpiVisualize: () => `${baseUrl}/company/kpi-data/get/visual`,

  getHealthScoreList: () => `${baseUrl}/company/health/dashboard/get`,

  selectCompanyList: () => `${baseUrl}/auth/switch-company`,

  uploadImage: () => `${baseUrl}/file/upload`,

  getAllEmployeeDd: () => `${baseUrl}/company/employee/get-all`,

  getUserLogById: () => `${baseUrl}/company/employee/get-log`,

  updateFireToken: () => `${baseUrl}/firebase/fcm-token/update`,

  detailMeetingCheckStatus: (id: string) =>
    `${baseUrl}/company/detail-meeting/start/${id}`,

  updateDetailMeetingCheckStatus: (id: string) =>
    `${baseUrl}/company/detail-meeting/update/${id}`,

  endMeeting: (id: string) => `${baseUrl}/company/detail-meeting/end/${id}`,

  getUserFireNotification: () =>
    `${baseUrl}/company/employee/logs/notification-get`,

  updateFireNotificationAsRead: () =>
    `${baseUrl}/company/employee/logs/notification-update`,

  addMeetingAgenda: () => `${baseUrl}/company/detail-meeting/agenda/io/add`,

  updateMeetingAgenda: (id: string) =>
    `${baseUrl}/company/detail-meeting/agenda/io/update/${id}`,

  getMeetingAgendaObjective: () =>
    `${baseUrl}/company/detail-meeting/agenda/io/get`,

  deleteMeetingAgendaObjective: (id: string) =>
    `${baseUrl}/company/detail-meeting/agenda/io/delete/${id}`,

  detailMeetingAgendaIssue: (id: string) =>
    `${baseUrl}/company/detail-meeting/agenda/io/get/${id}`,

  addMeetingTaskData: () => `${baseUrl}/company/detail-meeting/task/add`,
  getMeetingTaskData: () => `${baseUrl}/company/detail-meeting/task/get`,
  deleteMeetingTaskData: () => `${baseUrl}/company/detail-meeting/task/remove`,

  addMeetingProjectData: () => `${baseUrl}/company/detail-meeting/project/add`,
  getMeetingProjectData: () => `${baseUrl}/company/detail-meeting/project/get`,
  deleteMeetingProjectData: () =>
    `${baseUrl}/company/detail-meeting/project/remove/`,

  addMeetingKpisData: () => `${baseUrl}/company/detail-meeting/kpi/add`,
  getMeetingKpisData: () => `${baseUrl}/company/detail-meeting/kpi/get`,
  getMeetingSelectedKpisData: () =>
    `${baseUrl}/company/detail-meeting/kpi/get-data`,

  deleteMeetingKpisData: () => `${baseUrl}/company/detail-meeting/kpi/remove`,
  allKpiList: () => `${baseUrl}/company/kpi/get-detail-meeting`,

  getDetailMeetingById: (id: string) =>
    `${baseUrl}/company/detail-meeting/get/${id}`,
  updateDetailMeetingById: (id: string) =>
    `${baseUrl}/company/detail-meeting/update/${id}`,
  detailMeetingAdd: () => `${baseUrl}/company/detail-meeting/add`,
  detailMeetingGet: () => `${baseUrl}/company/detail-meeting/get`,
  detailMeetingDelete: (id: string) =>
    `${baseUrl}/company/detail-meeting/delete/${id}`,

  getConclusionByMeeting: (id: string) =>
    `${baseUrl}/company/detail-meeting/get-conclusion/${id}`,

  getConclusionTime: (id: string) =>
    `${baseUrl}/company/detail-meeting/get-time/${id}`,

  addMeetingnotes: () => `${baseUrl}/company/detail-meeting/note/create`,

  updateMeetingnotes: (id: string) =>
    `${baseUrl}/company/detail-meeting/note/update/${id}`,

  getMeetingnotes: (id: string) =>
    `${baseUrl}/company/detail-meeting/note/get/${id}`,

  addIssues: () => `${baseUrl}/company/issue/create`,
  updateIssues: (id: string) => `${baseUrl}/company/issue/update/${id}`,
  getIssues: () => `${baseUrl}/company/issue/get`,
  deleteIssues: (id: string) => `${baseUrl}/company/issue/delete/${id}`,

  addObjective: () => `${baseUrl}/company/objective/create`,
  updateObjective: (id: string) => `${baseUrl}/company/objective/update/${id}`,
  getObjective: () => `${baseUrl}/company/objective/get`,
  deleteObjective: (id: string) => `${baseUrl}/company/objective/delete/${id}`,

  getDetailObjectivesIssue: () =>
    `${baseUrl}/company/detail-meeting/get-non-select-io`,

  updateDetailObjectivesIssue: () =>
    `${baseUrl}/company/detail-meeting/agenda/update`,

  getNonSelectKpiList: () => `${baseUrl}/company/kpi/non-select-for-merge`,
  getKpiMergeById: (id: string) => `${baseUrl}/company/kpi-merge/get/${id}`,
  createKPIMerge: () => `${baseUrl}/company/kpi-merge/create`,
  updateKPIMerge: (id: string) => `${baseUrl}/company/kpi-merge/update/${id}`,

  deleteCompanyMeetingNote: (id: string) =>
    `${baseUrl}/company/detail-meeting/note/delete/${id}`,

  updateDetailMeetingKPIData: () =>
    `${baseUrl}/company/detail-meeting/kpi/update-data`,

  addRepeatCompanyTask: () => `${baseUrl}/company/repetitive-task/create`,
  updateRepeatCompanyTask: (id: string) =>
    `${baseUrl}/company/repetitive-task/update/${id}`,
  deleteRepeatCompanyTask: (id: string) =>
    `${baseUrl}/company/repetitive-task/delete/${id}`,
  getAllRepeatCompanyTaskByPage: () => `${baseUrl}/company/repetitive-task/get`,
  getRepeatCompanyTaskById: (id: string) =>
    `${baseUrl}/company/repetitive-task/get/${id}`,

  createIo: () => `${baseUrl}/company/detail-meeting/agenda/io/create-add`,

  // Repeat Meeting Api
  getRepeatMeetingList: () => `${baseUrl}/company/repetitive-meeting/get`,
  getByIdRepeatMeetingList: (id: string) =>
    `${baseUrl}/company/repetitive-meeting/get/${id}`,
  addRepeatMeetingList: () => `${baseUrl}/company/repetitive-meeting/create`,
  updateRepeatMeetingList: (id: string) =>
    `${baseUrl}/company/repetitive-meeting/update/${id}`,
  deleteRepeatMeetingList: (id: string) =>
    `${baseUrl}/company/repetitive-meeting/delete/${id}`,

  ddRepeatMeetingIo: () =>
    `${baseUrl}/company/repetitive-meeting/get-non-select-io`,
  addRepeatMeetingIo: () => `${baseUrl}/company/repetitive-meeting/add-io`,

  createRepeatMeetingIo: () =>
    `${baseUrl}/company/repetitive-meeting/agenda/io/create-add`,

  getRepeatMeetingNotes: () => `${baseUrl}/company/repetitive-meeting/note/get`,
  addRepeatMeetingNotes: () => `${baseUrl}/company/repetitive-meeting/note/add`,
  updateRepeatMeetingNotes: (id: string) =>
    `${baseUrl}/company/repetitive-meeting/note/update/${id}`,
  deleteRepeatMeetingNotes: (id: string) =>
    `${baseUrl}/company/repetitive-meeting/note/delete/${id}`,

  getRepeatMeetingAgendaIo: () =>
    `${baseUrl}/company/repetitive-meeting/agenda/io/get`,
  deleteRepeatMeetingAgendaIo: () =>
    `${baseUrl}/company/repetitive-meeting/remove-io`,

  duplicateDetailMeeting: () => `${baseUrl}/company/detail-meeting/duplicate`,

  ddAllNonSelectDatapointList: () => `${baseUrl}/kpi/get-all`,

  updateKPISequence: () => `${baseUrl}/company/kpi-data/sequence/update`,

  createTODOList: () => `${baseUrl}/company/to-do/create`,
  getAllTODOList: () => `${baseUrl}/company/to-do/get-all`,

  getAllTODOListFile: (id: string) => `${baseUrl}/company/to-do/get-all/${id}`,
  getByIdTODOList: (id: string) => `${baseUrl}/company/to-do/get/${id}`,
  updateTODOList: (id: string) => `${baseUrl}/company/to-do/update/${id}`,
  deleteTODOList: (id: string) => `${baseUrl}/company/to-do/delete/${id}`,
  updateTODOnotes: (id: string) => `${baseUrl}/company/to-do/note/update/${id}`,
  addTODOnotes: () => `${baseUrl}/company/to-do/note/create`,
  getTODOnotes: (id: string) => `${baseUrl}/company/to-do/note/get/${id}`,
  deleteTODOnote: (id: string) => `${baseUrl}/company/to-do/note/delete/${id}`,
};

export default Urls;
