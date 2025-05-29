import {
  sendOtpMutation,
  verifyCompanyOtpMutation,
  verifyOtpMutation,
} from "@/features/api/login";
import { useAuth } from "@/features/auth/useAuth";
import { useState } from "react";
import { useForm } from "react-hook-form";

const useLogin = () => {
  const { mutate: sendOtp } = sendOtpMutation();
  const { mutate: verifyOtp } = verifyOtpMutation();
  const { mutate: companyVerifyOtp } = verifyCompanyOtpMutation();
  const { setToken } = useAuth();
  const [statusSentOtp, setStatusSentOtp] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isCompanyModalOpen, setCompanyModalOpen] = useState(false);
  const [loginDetails, setLoginDetails] = useState<Login | null>(null);
  const [countryCode, setCountryCode] = useState("+91");

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
    reset,
    control,
  } = useForm<Login>({
    defaultValues: {
      mobile: "",
      userType: "",
      otp: "",
    },
  });

  const handleLogin = async (data: CompanyLogin) => {
    const verifyCompanyData = {
      companyId: data.companyId,
      consultantId: data.consultantId,
      mobile: countryCode + (loginDetails?.mobile || data.mobile),
      userType: loginDetails?.userType || data.userType,
    };

    companyVerifyOtp(verifyCompanyData, {
      onSuccess: (response) => {
        if (response?.status) {
          setToken(response?.user?.token, response?.user);
          reset();
          setCompanyModalOpen(false);
          setLoginDetails(null);
          if (response?.company?.some((company) => company.isReload)) {
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
        } else {
          throw new Error(response.message || "Failed to select company");
        }
      },
    });
  };

  const onSubmit = async (data: Login) => {
    setLoginDetails(data);
    if (!statusSentOtp) {
      const sendData = {
        mobile: countryCode + data.mobile,
        userType: data.userType,
      };

      sendOtp(sendData, {
        onSuccess: (response) => {
          setStatusSentOtp(response.status);
        },
      });
    } else {
      const verifyData = {
        mobile: countryCode + data.mobile,
        userType: data.userType,
        otp: data.otp,
      };

      verifyOtp(verifyData, {
        onSuccess: (response) => {
          if (response.status) {
            const companiesList = response.companies || [];
            if (companiesList.length > 1) {
              setCompanies(companiesList);
              setCompanyModalOpen(true);
            } else {
              setToken(response.user.token, response.user);
              setLoginDetails(null);
            }
          } else {
            throw new Error(response.message || "Invalid OTP");
          }
        },
      });
    }
  };

  return {
    register,
    handleFormSubmit: handleSubmit(onSubmit),
    errors,
    statusSentOtp,
    trigger,
    setValue,
    control,
    companies,
    isCompanyModalOpen,
    handleLogin,
    countryCode,
    setCountryCode,
    setCompanyModalOpen,
    reset,
    onSubmit,
  };
};

export default useLogin;
