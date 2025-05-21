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
