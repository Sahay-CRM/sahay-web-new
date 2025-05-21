// hooks/useAddAdminUser.ts
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

export const useAddConsultant = () => {
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

  const onSubmit = async (data: FormValues): Promise<void> => {
    console.log("Submitted Data:", data);
  };

  return {
    onSubmit,
    methods,
  };
};
