// hooks/useAddCompanyEmployee.ts
import { useGetCompanyMeetingById } from "@/features/api/companyMeeting";
import useAddUpdateCompanyMeeting from "@/features/api/companyMeeting/useAddUpdateCompanyMeeting";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

interface FormValues {
  name: string;
  description: string; // ✅ Add this
  meetingDateTime: Date | null;
  departmentId: string;
  designationId: string;
  reportingManagerId: string;
}

const steps = ["Meeting Info", "Meeting Status", "Meeting Type", "Joiners"];

export const userTypeOptions = [
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Manager" },
  { value: "employee", label: "Employee" },
];

export const useAddCompanyEmployee = () => {
  const { id } = useParams<{ id?: string }>();

  const methods = useForm<FormValues>({
    defaultValues: {
      name: "", // ✅ Add
      description: "",
      meetingDateTime: null,
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
    1: ["name", "meetingDateTime"],
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

  const { data: fetchedData } = useGetCompanyMeetingById(id);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { mutate: addOrUpdateConsultant } = useAddUpdateCompanyMeeting();

  useEffect(() => {
    if (id && fetchedData) {
      methods.reset({
        meetingName: fetchedData?.data?.meetingName,
        meetingDescription: fetchedData?.data?.meetingDescription,
        meetingDateTime: fetchedData?.data?.meetingDateTime,
      });
    }
  }, [id, fetchedData, methods]);

  const onSubmit = async () => {};

  const fetchEmployeeById = async (): Promise<
    FormValues & { countryCode?: string }
  > => {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve({
          name: "Alice Johnson",
          description: "Quarterly review meeting",
          meetingDateTime: null,
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
    fetchEmployeeById,
  };
};
