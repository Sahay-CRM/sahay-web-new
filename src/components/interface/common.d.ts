interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
  isLoading?: boolean;
}

interface CountryData {
  countryName: string;
  countryId: string;
}

interface ErrorType {
  type?: string;
  message?: string;
}

interface DepartmentDataProps {
  departmentId: string;
  departmentName: string;
}

interface ConsultantDataProps {
  consultantId: string;
  consultantName: string;
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

interface MeetingData {
  meetingId: string;
  topic: string;
  agenda: string;
  meetingDate: string;
}

interface ImportantDateData {
  dateId: string;
  label: string;
  note: string;
  date: string;
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
