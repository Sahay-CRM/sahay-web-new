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
  parentId: null;
  companyId: string;
  departmentId: string;
  departmentName: string;
  companyName: string;
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
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeeMobile: string;
  companyId: string;
  employeeType: string;
  departmentId?: string | null | DepartmentData;
  designationId?: string | null | Designation;
  isSuperAdmin: boolean;
  sahayEmId?: string | null;
  reportingManagerId?: string | null;
  company: Company;
  reportingManager?: ReportingManager | null;
  departmentName?: string | null;
  designationName?: string | null;
  companyEmployeeId?: string | null;
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
// kk
interface Employee {
  employeeId: string;
  employeeName: string;
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

interface SubParameter {
  subParameterId: string;
  subParameterName: string;
  coreParameterId: string;
  coreParameter: CoreParameter;
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
}

//kk
interface MeetingData {
  meetingId?: string;
  meetingName?: string;
  meetingDescription?: string;
  meetingDateTime?: string; // ISO string format
  companyId?: string;
  meetingTypeId?: string;
  meetingStatusId?: string;

  meetingType?: {
    meetingTypeId: string;
    meetingTypeName: string;
  };

  companyEmployee?: {
    employeeId: string;
    employeeName: string;
    employeeMobile: string;
  };

  company?: {
    companyId: string;
    companyAdminEmail: string;
    companyAdminMobile: string;
  };

  meetingStatus?: MeetingStatusDataProps;

  joiners?: {
    companyEmployee: {
      employeeId: string;
      employeeName: string;
      employeeMobile: string;
    };
  }[];
}
///kk
interface IProjectFormData {
  projectId?: string;
  projectName: string;
  projectDescription: string;
  projectDeadline: string;
  projectStatusId: string;

  employeeIds: string[];

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
  importantDateRemarks: string;
  importantDateName: string;
  importantDate: string;
  importantDateId?: string;
}

interface CompanyMeetingDataProps {
  meetingId?: string;
  meetingName: string;
  meetingDescription: string;
  meetingDateTime: string;
  meetingTypeId: string;
  meetingStatusId: string;
  companyMeetingId?: string;
  joiners?: string[];
}

interface CompanyMeetingStatusDataProps {
  meetingStatusId: string;
  meetingStatus: string;
  meetingStatusOrder: number;
  winLostMeeting: null;
}

interface CompanyMeetingTypeDataProps {
  meetingTypeId: string;
  meetingTypeName: string;
}

interface CompanyProjectDataProps {
  srNo: number;
  projectId: string;
  projectName: string;
  projectDescription: string;
  projectActualEndDate: string;
  projectDeadline: string;
  employeeId: string;
  ProjectSubParameterJunction: ProjectSubParameterJunctionItem[];
}

interface ProjectSubParameterJunctionItem {
  projectSubParameterId: string;
  subPara: SubParameter;
}

interface SubParameter {
  subParameterId: string;
  subParameterName: string;
  coreParameterId: string;
  coreParameter: CoreParameter;
}

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

interface TaskData {
  taskId: string;
  taskName: string;
  taskDescription: string;
  taskDeadline: string;
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
}

interface EmployeeCompany {
  companyAdminName: string;
  companyId: string;
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
  reportingManager: string | null;
}

interface Designation {
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

interface MeetingJoiner {
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

interface DataPoint {
  dataPointId: string;
  dataPointName: string;
  dataPointLabel: string;
}

interface FrequencyData {
  srNo: number;
  frequencyType: string;
  dataPoint: DataPoint[];
}

type FrequencyDataArray = FrequencyData[];
