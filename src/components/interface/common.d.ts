interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
  isLoading?: boolean;
}
interface DepartmentData {
  departmentId?: string;
  departmentName: string;
}
interface DepartmentResponse {
  message: string;
  currentPage: number;
  totalCount: number;
  hasMore: boolean;
  pageSize: number;
  totalPage: number;
  data: DepartmentData[];
}
interface FilterDataProps {
  filter: T | null;
  enable?: boolean;
}
//designation interface add krishna
interface DesignationData {
  designationId: string;
  designationName: string;
  parentId: null | string;
  companyId: string;
  departmentId: string;
  departmentName: string;
  companyName: string;
  isParentDesignation?: boolean;
}
// kk
interface DesignationAddFormProps {
  isModalOpen: boolean;
  modalClose: () => void;
  modalData?: DesignationData;
}

interface designationResponse {
  message: string;
  currentPage: number;
  totalCount: number;
  hasMore: boolean;
  pageSize: number;
  totalPage: number;
  data: DesignationData[];
}
interface EmployeeResponse {
  message: string;
  currentPage: number;
  totalCount: number;
  hasMore: boolean;
  pageSize: number;
  totalPage: number;
  data: EmployeeData[];
}
// kk
interface Company {
  companyAdminName: string;
  companyId: string;
}
// kk
interface EmployeeData {
  employeeId?: string;
  employeeName?: string;
  employeeEmail?: string;
  employeeMobile: string;
  companyId?: string;
  employeeType?: string;
  departmentId?: string | null | DepartmentData;
  designationId?: string | null | Designation;
  isSuperAdmin?: boolean;
  sahayEmId?: string | null;
  reportingManagerId?: string | null;
  company?: Company;
  reportingManager?: ReportingManager | null;
  departmentName?: string | null;
  designationName?: string | null;
  companyEmployeeId?: string | null;
  department?: DepartmentData;
  designation?: Designation | null;
  employee?: EmployeeDataModal;
  isDeactivated?: boolean;
}

// kk
interface CompanyTaskData {
  taskId: string;
  taskName: string;
  taskDescription: string;
  taskDeadline: string; // ISO format string (e.g., from backend); use Date if you're converting it
  taskActualEndDate: string | null;
  taskStatusId: string;
  taskStatusName: string;
  taskTypeId: string;
  taskTypeName: string;
  createdByEmployee: Employee;
  assignees: Employee[];
}
//kk
interface CoreParameter {
  coreParameterId: string;
  departmentId: string;
  coreParameterName: string;
  createdBy: string;
  updatedBy: string;
  isDelete: boolean;
  createdDatetime: string;
  updatedDatetime: string;
}
// kk
// interface Employee {
//   employeeId: string;
//   employeeName: string;
// }

interface SubParameter {
  subParameterId: string;
  subParameterName: string;
  coreParameterId: string;
  coreParameter: CoreParameter;
}

interface CompanyLevelRes {
  levelId: string;
  levelName: string;
}

interface MeetingsData {
  meetingId: string;
  topic: string;
  agenda: string;
  meetingDate: string;
}

interface ImportantDateData {
  importantDateRemarks: string;
  importantDateName: string;
  importantDate: string;
  importantDateId?: string;
  color?: string;
}

interface TaskData {
  taskId: string;
  taskName: string;
  taskDescription: string;
  taskDeadline: string;
}

interface EventData {
  eventId: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  importantDateRemarks?: string;
  importantDateName?: string;
  importantDate?: string;
  importantDateId?: string;
  bgColor?: string;
  textColor?: string;
  eventType?: string;
}

//kk
interface MeetingData {
  meetingId?: string;
  meetingName: string;
  meetingDescription?: string;
  meetingDateTime: string;
  companyId?: string;
  meetingTypeId: string;
  meetingTypeName?: string;
  meetingStatusId: string;
  meetingStatus?: string | MeetingStatusDataProps;
  color?: string;
  joiners?: Employee[];
  [key: string]: string | string[] | number | undefined;
}
///kk
interface IProjectFormData {
  projectId?: string;
  projectName: string;
  projectDescription: string;
  projectDeadline: string;
  projectStatusId: string;

  employeeIds: string[];
  projectStatus?: {
    projectStatus: string;
  };
  subParameterIds: string[];

  createdBy?: {
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
    employeeMobile: string;
  };

  ProjectEmployees?: {
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
  }[];

  ProjectSubParameterJunction?: {
    projectSubParameterId: string;
    subPara: {
      subParameterId: string;
      subParameterName: string;
      coreParameterId: string;
      coreParameter: {
        coreParameterId: string;
        coreParameterName: string;
      };
    };
  }[];
}

//
interface RolePermission {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeeMobile: string;
  companyId: string;
  employeeType: string; // You can restrict this more based on allowed values
  departmentId: string;
  designationId: string;
  isSuperAdmin: boolean;
  sahayEmId: string | null;
  reportingManagerId: string;

  company: {
    companyAdminName: string;
    companyId: string;
  };

  reportingManager: {
    employeeEmail: string;
    employeeId: string;
    employeeName: string;
  };

  departmentName: string;
  designationName: string;
}

interface CountryData {
  countryName: string;
  countryId: string;
}

interface ErrorType {
  type?: string;
  message?: string;
}

interface ImportantDatesDataProps {
  importantDateId?: string;
  importantDateName: string;
  importantDateRemarks: string;
  importantDate: string;
  importantDateType?: string;
  bgColor?: string;
  color?: string;
  textColor?: string;
  eventType?: string;
}

interface CompanyMeetingDataProps {
  meetingId?: string;
  meetingName?: string;
  meetingDescription?: string;
  meetingDateTime?: string;
  meetingTypeId?: string;
  parentType?: string;
  meetingStatusId?: string;
  companyMeetingId?: string;
  joiners?: string[] | Joiners[];
  meetingStatus?: CompanyMeetingStatusDataProps;
  meetingType?: CompanyMeetingTypeDataProps;
  files?: [
    {
      fileId: string;
      fileName: string;
    },
  ];
  teamLeaders?: string[];
  employeeId?: string;
  attendanceMark?: boolean;
  detailMeetingStatus?: string;
}

interface Joiners {
  employeeId: string;
  employeeName: string;
  isTeamLeader?: boolean;
  photo?: string;
}

interface CompanyDatapointDataProps {
  KPIName: string;
  KPIMasterId: string;
  KPILabel: string;
  industryId: string;
  industryName: string;
  isIndustrySpecific: true;
}
interface DatapointListData {
  KPIName: string;
  KPIMasterId: string;
  KPILabel: string;
  industryId: string;
  industryName: string;
  isIndustrySpecific: true;
}

interface CompanyMeetingStatusDataProps {
  meetingStatusId: string;
  meetingStatus: string;
  meetingStatusOrder: number;
  winLostMeeting: number | null;
  color?: string;
  createdDatetime?: string;
  updatedDatetime?: string;
}

interface CompanyMeetingTypeDataProps {
  meetingTypeId: string;
  meetingTypeName: string;
  parentType?: string;
}

interface CompanyProjectDataProps {
  projectId?: string;
  projectName?: string;
  projectDescription?: string;
  projectActualEndDate?: string | null;
  projectDeadline?: string;
  employeeId?: string;
  ProjectParameters?: ProjectParameters;
  ProjectEmployees?: Employee[];
  ProjectTasks?: ProjectTask[];
  createdBy?: CreatedBy;
  projectStatusId: string;
  projectStatus?: ProjectStatusRes;
  otherProjectEmployees?: string[];
}

interface ProjectParameters {
  coreParameter: CoreParameter;
  subParameters: SubParameter[];
}

interface CoreParameter {
  coreParameterId: string;
  coreParameterName: string;
}

interface SubParameter {
  projectSubParameterId: string;
  subParameterId: string;
  subParameterName: string;
}

interface ProjectSubParameterJunctionItem {
  projectSubParameterId: string;
  subPara: SubParameter;
}
interface ProjectStatusRes {
  projectStatusId: string;
  projectStatus: string;
  projectStatusOrder: number;
  winLostProject: null;
  color?: string;
}

interface SubParameter {
  subParameterId: string;
  subParameterName: string;
  coreParameterId: string;
  coreParameter: CoreParameter;
}

interface CoreParameter {
  coreParameterId: string;
  coreParameterName: string;
  departmentId: string;
  departmentName: string;
}

interface DesignationDataProps {
  designationId: string;
  designationName: string;
  departmentName: string;
}

interface ConsultantDataProps {
  consultantId: string;
  consultantName: string;
}
interface MeetingStatusDataProps {
  meetingStatusId: string;
  meetingStatus: string;
}

interface AdminUserTypeDataProps {
  adminUserTypeId: string;
  adminUserTypeName: string;
}

interface EngagementTypeDataProps {
  engagementTypeId: string;
  engagementTypeName: string;
}

interface IndustryTypeDataProps {
  industryId: string;
  industryName: string;
}

interface CoreParameterDataProps {
  coreParameterId: string;
  coreParameterName: string;
}
interface EventData {
  eventId: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
}

interface BaseResponse<T> {
  success: boolean;
  status: number;
  message: string;
  currentPage: number;
  totalCount: number;
  hasMore: boolean;
  pageSize: number;
  totalPage: number;
  sortBy: string;
  sortOrder: string;
  data: T[];
}

interface DesignationDetails {
  srNo: number;
  designationId: string;
  designationName: string;
  parentId: null;
  companyId: string;
  departmentId: string;
  departmentName: string;
  companyName: string;
}

interface EmployeeDetails {
  srNo: number;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeeMobile: string;
  companyId: string;
  employeeType: string;
  departmentId: string;
  designationId: string;
  isSuperAdmin: false;
  sahayEmId: null;
  departmentName: null;
  designationName: null;
  reportingManagerId: null;
  companyAdminName: string;
  reportingManager: null;
  isDeactivated?: boolean;
  isTeamLeader?: boolean;
}

interface EmployeeCompany {
  companyAdminName: string;
  companyId: string;
  companyName: string;
}

interface EmployeeDetailsById {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeeMobile: string;
  companyId: string;
  employeeType: string;
  departmentId: string | null;
  department: string | null;
  designationId: string | null;
  designation: string | null;
  reportingManagerId: string | null;
  company: EmployeeCompany;
  reportingManager: EmployeeDetails;
  companyLogo?: string;
  photo?: string;
  isSuperAdmin: boolean;
  isDeactivated?: boolean;
}

interface Designation {
  designationId: string;
  designationName: string;
}

interface EmployeeDataModal {
  employeeName: string;
  employeeEmail: string;
  employeeMobile: string;
  employeeType: string;
  departmentId?: {
    departmentName: string;
  };
  designationId?: Designation;
  employeeId?: {
    employeeName: string;
  };
}

interface LevelDataProps {
  levelId?: string;
  levelName: string;
  isDefault?: boolean;
  sequence?: number;
}

interface CompanyLevelJunction {
  companyLevelJunctionId: string;
  coreParameterId: string;
  currentLevelId: string;
}

interface HealthScore {
  subParameterId: string;
  score: number;
}

interface HealthScoreData {
  score: number;
  subParameterId: string;
  subParameterName: string;
}
interface TaskStatusAllRes {
  taskStatusId: string;
  taskStatus: string;
  taskStatusOrder: number;
  winLostTask: string | number | null;
  color?: string;
}

interface TaskTypeData {
  taskTypeId?: string;
  taskTypeName: string;
}

interface AddUpdateTask {
  taskId?: string;
  taskName?: string;
  taskDescription?: string;
  taskStartDate?: Date | null;
  taskDeadline?: Date | null;
  repetition?: string;
  taskStatusId?: string;
  taskTypeId?: string;
  comment?: string;
  assigneeIds?: string[];
  projectId?: string;
}

interface TaskGetPaging {
  employeeId: string;
  taskId: string;
  assigneeNames?: string;
  taskName: string;
  taskStatusId: string;
  taskDescription: string;
  taskStatus: string;
  createdBy?: Employee;
  updatedBy?: string;
  isDelete?: boolean;
  createdDatetime?: string;
  updatedDatetime?: string;
  taskTypeId: string;
  taskTypeName?: string;
  taskActualEndDate?: string | null;
  companyId?: string;
  taskDeadline?: string;
  TaskCommentMaster?: TaskComment[];
  TaskEmployeeJunction?: TaskEmployee[];
  TaskMeetingJunction?: TaskMeeting[];
  companyAdminName?: string;
  companyAdminEmail?: string;
  employees?: Employee;
  projectDetails?: TaskProject;
  taskDeadline?: string;
  taskStartDate?: string;
  color?: string;
}

interface TaskProject {
  projectId: string;
  CompanyProjectMaster: {
    projectId: string;
    projectName: string;
  };
}

interface Employee {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeeMobile: string;
  companyId: string;
  employeeType: string;
  departmentId: string | null;
  department: string | null;
  designationId: string | null;
  designation: string | null;
  reportingManagerId: string | null;
  company: {
    companyAdminName: string;
    companyId: string;
  };
  reportingManager: string;
}

interface TaskComment {
  comment: string;
  commentDate: string;
  employeeId: string;
  Employee: {
    employeeName: string;
    employeeId: string;
  };
}

interface TaskEmployee {
  employeeId: string;
  Employee: {
    employeeId: string;
    employeeName: string;
  };
}

interface TaskMeeting {
  meetingId: string;
  meetings: {
    meetingId: string;
    companyId: string;
    employeeId: string;
    meetingTypeId: string;
    meetingStatusId: string;
    meetingName: string;
    meetingDescription: string;
    meetingDateTime: string;
    createdBy: string;
    updatedBy: string;
    isDelete: boolean;
    createdDatetime: string;
    updatedDatetime: string;
  };
}

interface Task {
  taskId: string;
  taskName: string;
  taskDescription: string;
  taskStatusId: string;
  taskStatusName: string;
  taskTypeId: string;
  taskTypeName: string;
  taskActualEndDate: string | null;
  taskStartDate: string;
  taskDeadline: string;
  projectId: string;
  projectName: string | null;
  assignUsers: Employee[];
  meetingId: string;
  meetings: Meeting[];
  comments: TaskComment[];
  createdBy: CreatedBy;
}

interface ProjectTask {
  taskName: string;
  taskDescription: string;
  taskStatus: TaskStatusAllRes;
  taskStatusId: string;
  taskId: string;
  taskActualEndDate: string | null;
  taskDeadline: string;
  taskTypeId: string;
  assignees: {
    employeeId: string;
    employeeName: string;
  }[];
}
interface MeetingJoiner {
  employeeId: string;
  employeeName: string;
}

interface Meeting {
  meetingId: string;
  companyId: string;
  employeeId: string;
  meetingTypeId: string;
  meetingStatusId: string;
  meetingName: string;
  meetingDescription: string;
  meetingDateTime: string;
  meetingDocuments: unknown; // Replace with correct type if known
  createdBy: string;
  updatedBy: string;
  isDelete: boolean;
  createdDatetime: string;
  updatedDatetime: string;
  color?: string;
}

interface TaskComment {
  commentId: string;
  comment: string;
  commentDate: string;
  employeeId: string;
  employeeName: string;
}

interface CreatedBy {
  employeeId: string;
  employeeName: string;
}
interface MeetingType {
  meetingTypeId: string;
  meetingTypeName: string;
}

interface MeetingStatus {
  meetingStatusId: string;
  meetingStatus: string;
}

interface MeetingDataById {
  meetingId: string;
  meetingName: string;
  meetingDescription: string;
  meetingDateTime: string;
  companyId: string;
  employeeId: string;
  meetingTypeId: string;
  meetingType: MeetingType;
  meetingStatusId: string;
  meetingStatus: MeetingStatus;
  joiners: MeetingJoiner[];
}
interface SubParaByCorePara {
  subParameterId: string;
  subParameterName: string;
  isDisabled?: boolean;
  companyHealthWeightage: number;
}

interface CoreParameterData {
  coreParameterId: string;
  subParameterIds: SubParameterByWeightage[];
  removedSubParameterIds: string;
}
interface SubParameterByWeightage {
  subParameterId: string;
  companyHealthScore: number;
}
interface KPIMaster {
  KPIName: string;
  KPILabel: string;
}

interface DataPointEmployee {
  employeeId: string;
  dataPointEmpId?: string;
  employeeName: string;
  value1: string;
  value2?: string;
}

// interface KPIFormData {
//   companykpimasterId?: string;
//   dataPointId: string;
//   dataPointName: string;
//   dataPointLabel: string;
//   KPIMasterId: string;
//   KPILabel?: string;
//   KPIName?: string;
//   KPIMaster: KPIMaster;
//   coreParameter?: CoreParameter;
//   coreParameterId: string | null;
//   unit: string;
//   validationType: string;
//   frequencyType: string;
//   selectedType: string;
//   dataPointEmployeeJunction: DataPointEmployee[];
//   DataPointProductJunction: ProductData[];
//   productIds: ProductData[] | string[];
//   assignUser: DataPointEmployee[];
//   hasData: boolean;
//   visualFrequencyTypes?: string;
//   hasDataEmployeeIds?: string[];
// }

interface KPIFormData {
  kpiId?: string;
  dataPointName?: string;
  dataPointLabel?: string;
  KPIMasterId?: string;
  KPIMaster?: {
    KPIName: string;
    KPILabel: string;
  };
  KPIName?: string;
  KPILabel?: string;
  validationType: string;
  frequencyType: string;
  selectedType?: string | null;
  unit: string;
  coreParameter?: {
    coreParameterId: string;
  };
  visualFrequencyTypes: string;
  employeeId: string;
  value1: string;
  value2: string;
  tag: string;
  coreParameterId?: string;
  hasData?: boolean;
  employeeName?: string;
}

interface KPIFormDataProp {
  companykpimasterId?: string;
  dataPointId: string;
  dataPointName: string;
  dataPointLabel: string;
  KPIMasterId?: {
    KPILabel?: string;
    KPIMasterId?: string;
    KPIName?: string;
  };
  coreParameterId: {
    coreParameterId?: string;
  };
  KPILabel?: string;
  KPIName?: string;
  KPIMaster: KPIMaster | string;
  coreParameter: string;
  unit: string;
  validationType: string;
  frequencyType: string;
  selectedType: string;
  dataPointEmployeeJunction: DataPointEmployee[];
  DataPointProductJunction: ProductData[];
  productIds: ProductData[];
  assignUser: DataPointEmployee[];
  hasData: boolean;
}
interface BrandFormModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  modalData?: BrandData;
}

interface BrandData {
  brandId?: string;
  brandName: string;
  brandDescription?: string;
  brandLogo?: string;
}

interface CommonResponse<T> {
  message: string;
  currentPage: number;
  totalCount: number;
  hasMore: boolean;
  pageSize: number;
  totalPage: number;
  data: T;
}

interface ProductData {
  brandId?: string;
  productId?: string;
  productName: string;
  productDescription?: string;
  productImage?: string;
}

interface ProductFormModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  modalData?: ProductData;
}

interface HandleDateRangeChange {
  (range: DateRange | undefined): void;
}
interface DataPoint {
  dataPointId: string;
  dataPointName: string;
  dataPointLabel: string;
}

interface Assignee {
  dataPointEmpId: string;
  employeeName: string;
  value1: string | number | null;
  value2?: string | number | null;
  photo?: string | null;
}

interface Kpi {
  kpiId: string;
  kpiName: string;
  kpiLabel: string;
  unit: string | null;
  validationType: string;
  assignees: Assignee[];
  isVisualized: boolean;
  employeeName: string;
  value1: string;
  value2?: string | null;
  photo?: string | null;
  tag?: string;
}

interface CoreParameterGroup {
  coreParameterId: string;
  coreParameterName: string;
  kpis: Kpi[];
}

interface FrequencyData {
  srNo?: number;
  frequencyType: string;
  kpis: CoreParameterGroup[];
  count: number;
}

type FrequencyDataArray = FrequencyData[];

interface KpiData {
  dataPointEmpId: string;
  startDate: string;
  endDate: string;
  selectFrequency: string;
}

interface CompanyResult {
  totalWeightage: number;
  totalScore: number;
  healthPercentage: number;
}

interface IndividualResult {
  coreParameterId: string;
  totalWeightageCP: number;
  totalScoreCP: number;
  healthPercentage: number;
  coreParameterName: string;
}

interface HealthScoreResponse {
  success: boolean;
  status: number;
  message: string;
  companyResult: CompanyResult;
  individualResult: IndividualResult[];
}

interface KpiDataCell {
  kpiId: string;
  validationType: string;
  startDate: string;
  endDate: string;
  data: string | number | null;
  value1?: string | number | null;
  value2?: string | number | null;
  avg?: string | number | null;
}

interface UserLogDetails {
  id: string;
  updateDetail: string;
  updateTime: string | Date;
}

interface ChangeLog<T> {
  refId: string;
  refType: string;
  oldValue: T;
  newValue: T;
  logType: string;
  logTime: string;
}

interface MeetingIssue {
  detailMeetingAgendaIssueId: string;
  detailMeetingId: string;
  agendaIssue: string;
  issuePlannedTime?: string;
}

interface MeetingObjective {
  detailMeetingAgendaObjectiveId: string;
  detailMeetingId: string;
  agendaObjective: string;
  objectivePlannedTime?: string;
}

interface IssueObjective {
  agendaIssue?: string;
  detailMeetingAgendaIssueId?: string;
  detailMeetingId: string;
  isResolved?: boolean;
  issueActualTime?: string | null;
  issuePlannedTime?: string;
  sequence?: string | null;
  agendaObjective?: string;
  detailMeetingAgendaObjectiveId?: string;
  objectiveActualTime?: string | null;
  objectivePlannedTime?: string;
}

interface MeetingResFire {
  state: {
    lastSwitchTimestamp: number;
    activeTab: string;
    currentAgendaItemId?: string;
    status?: string;
  };
  timers: {
    agenda?: { actualTime: number };
    conclusion?: { actualTime: number };
    issues?: Record<string, { actualTime: number; updatedAt: number }>;
    objectives?: Record<string, { actualTime: number; updatedAt: number }>;
  };
  activeScreen?: string;
  meetingId: string;
  updatedAt: string | number;
  agenda?: { updatedAt: string | number };
  conclusion?: { updatedAt: string | number };
  discussion?: { updatedAt: string | number };
  follow?: string;
}

interface FbIssues {
  id: string;
  actualTime: string;
}

interface HandleTabChangeLocalProps {
  (tab: string): void;
}

interface KpiAllList {
  dataPointName?: string;
  dataPointLabel?: string;
  KPIMasterId?: string;
  kpiId: string;
  KPIName: string;
  KPILabel: string;
  validationType: string;
  frequencyType: string;
  selectedType?: string | null;
  coreParameterId?: string;
  employeeName?: string;
  dataPointEmployeeJunction?: {
    dataPointEmpId: string;
    employeeId: string;
    value1: string;
    value2: string;
    employeeName: string;
  }[];
  dataArray?: KpiDataCell[];
  tag?: string | null;
  value1: string;
  value2?: string | null;
  unit?: string;
  isVisualized: boolean;
}

interface SelectedKpisData {
  kpiId: string;
  kpiName: string;
  kpiLabel: string;
  frequencyType: string;
  tag?: string | null;
  unit: string;
  validationType: string;
  employeeName: string;
  isVisualized: boolean;
  value1: string;
  value2?: string | null;
  photo?: string | null;
  dataArray: KpiDataCell[];
}

interface MeetingDetailsTiming {
  meetingId: string;
  agendaTimePlanned?: string;
  agendaTimeActual?: string;
  discussionTaskTimePlanned?: string;
  discussionTaskTimeActual?: string;
  discussionProjectTimePlanned?: string;
  discussionProjectTimeActual?: string;
  discussionKPITimePlanned?: string;
  discussionKPITimeActual?: string;
  conclusionTimePlanned?: string;
  conclusionTimeActual?: string;
  employeeList?: {
    isTeamLeader?: boolean;
    employeeName: string;
    employeeId: string;
    attendanceMark: boolean | null;
  }[];
  employeeId?: string;
  attendanceMark?: boolean | null;
  updatedAt?: string;
  status?: string; // Added to match backend response
}

interface ConclusionResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    agenda: {
      issue: string[];
      objective: string[];
    };
    discussion: {
      taskUpdate: {
        oldValues: {
          taskName: string;
          taskDescription: string;
          taskDeadline: string;
          taskType: string;
          taskStatus: string;
          project: string;
          meeting: string;
          subParameters: string;
          taskEmployees: string;
        };
        newValues: {
          taskName: string;
          taskDescription: string;
          taskDeadline: string;
          taskType: string;
          taskStatus: string;
          project: string;
          meeting: string;
          subParameters: string;
          taskEmployees: string;
        };
      }[];
      projectUpdate: {
        oldValues: {
          projectName: string;
          projectDescription: string;
          projectDeadline: string;
          projectStatus: string;
          subParameters: string;
          projectEmployees: string;
        };
        newValues: {
          projectName: string;
          projectDescription: string;
          projectDeadline: string;
          projectStatus: string;
          subParameters: string;
          projectEmployees: string;
        };
      }[];
      kpiUpdate: {
        oldValues: {
          kpiName: string;
          kpiFrequency: string;
          kpiValidationType: string;
          kpiVisualFrequencyTypes: string | null;
          kpiUnit: string;
          coreParameter: string;
          value1: string;
          value2: string;
        };
        newValues: {
          kpiName: string;
          kpiFrequency: string;
          kpiValidationType: string;
          kpiVisualFrequencyTypes: string | null;
          kpiUnit: string;
          coreParameter: string;
          value1: string;
          value2: string;
        };
        recData?: {
          kpiId: string;
          startDate: string;
          endDate: string;
          data: string;
        }[];
      }[];
    };
  };
}

interface MeetingNotesRes {
  employeeId: string;
  note: string;
  detailMeetingNoteId: string;
}
