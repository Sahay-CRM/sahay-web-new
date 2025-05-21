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
