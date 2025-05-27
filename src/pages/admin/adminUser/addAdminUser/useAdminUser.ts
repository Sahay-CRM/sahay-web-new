// hooks/useAddAdminUser.ts
import { useState } from "react";
import { useForm } from "react-hook-form";

interface FormValues {
  name: string;
  mobile: string;
  email: string;
  userType: string;
  profilePic: string;
  emergencyName: string;
  emergencyPhone: string;
  relationship: string;
  pan: string;
  aadhaar: string;
}

const steps: string[] = ["Basic Details", "Emergency Contact", "Documentation"];

export const userTypeOptions = [
  { value: "dc91dfe2-4f42-4d35-8a26-860f76ead5bd", label: "Administrator" },
  { value: "a5af618e-85ed-4cc6-af67-34cdf42a504d", label: "SuperAdmin" },
  { value: "3b8c0603-b9af-4438-87fb-02483a260257", label: "Add Company KPI" },
  { value: "2a5e053f-d72b-4d1a-a018-8b163fe6c206", label: "Analyst" },
  { value: "bb82f2f6-713a-45ed-8484-62413f150a92", label: "Associate" },
  { value: "bb247ef6-244c-441f-9234-d40ce3b27e24", label: "Senior Associate" },
  { value: "675c40d3-0b70-4100-b00f-bc584d533678", label: "Senior Analyst" },
  { value: "38df3f82-2a2c-451d-9464-a20a3c551ac6", label: "Intern" },
];

export const useAddAdminUser = () => {
  const methods = useForm<FormValues>({
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      userType: "",
      profilePic: "",
      emergencyName: "",
      emergencyPhone: "",
      relationship: "",
      pan: "",
      aadhaar: "",
    },
    mode: "onChange",
  });

  const [step, setStep] = useState<number>(1);

  type Key = keyof FormValues;
  const fieldsToValidate: Record<number, Key[]> = {
    1: ["name", "mobile", "email", "userType"],
    2: ["emergencyName", "emergencyPhone", "relationship"],
    3: ["pan", "aadhaar"],
  };

  const validateStep = async (): Promise<boolean> => {
    return methods.trigger(fieldsToValidate[step]);
  };

  const nextStep = async (): Promise<void> => {
    if (await validateStep()) {
      setStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = (): void => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (): Promise<void> => {};

  return {
    step,
    steps,
    nextStep,
    prevStep,
    onSubmit,
    methods,
    userTypeOptions,
  };
};
