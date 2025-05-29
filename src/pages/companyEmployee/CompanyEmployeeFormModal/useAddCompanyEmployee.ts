// hooks/useAddCompanyEmployee.ts
import { useState } from "react";
import { useForm } from "react-hook-form";

interface FormValues {
  name: string;
  email: string;
  mobile: string;
  userType: string;
  departmentId: string;
  designationId: string;
  reportingManagerId: string;
}

const steps = ["Basic Info", "Organization Details"];

export const userTypeOptions = [
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Manager" },
  { value: "employee", label: "Employee" },
];

export const useAddCompanyEmployee = () => {
  const methods = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      userType: "",
      departmentId: "",
      designationId: "",
      reportingManagerId: "",
    },
    mode: "onChange",
  });

  const [step, setStep] = useState<number>(1);
  const [countryCode, setCountryCode] = useState<string>("+91");

  // Mocked data; replace with real API or Redux hooks
  const departmentData = [
    { value: "dept1", label: "Sales" },
    { value: "dept2", label: "Marketing" },
  ];
  const designationData = [
    { value: "des1", label: "Executive" },
    { value: "des2", label: "Manager" },
  ];
  const employees = [
    { value: "emp1", label: "John Doe" },
    { value: "emp2", label: "Jane Smith" },
  ];

  const fieldsToValidate: Record<number, (keyof FormValues)[]> = {
    1: ["name", "email", "mobile", "userType"],
    2: ["departmentId", "designationId", "reportingManagerId"],
  };

  const validateStep = async (): Promise<boolean> => {
    return methods.trigger(fieldsToValidate[step]);
  };

  const nextStep = async () => {
    if (await validateStep()) {
      setStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async () => {};

  // NEW: Fetch employee by ID (mock)
  const fetchEmployeeById = async (): Promise<
    FormValues & { countryCode?: string }
  > => {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve({
          name: "Alice Johnson",
          email: "alice@example.com",
          mobile: "9876543210",
          userType: "manager",
          departmentId: "dept1",
          designationId: "des2",
          reportingManagerId: "emp2",
          countryCode: "+91",
        });
      }, 300),
    );
  };

  return {
    step,
    steps,
    nextStep,
    prevStep,
    onSubmit,
    methods,
    userTypeOptions,
    departmentData,
    designationData,
    employees,
    countryCode,
    setCountryCode,
    fetchEmployeeById, // 👈 return this so component can use it
  };
};
