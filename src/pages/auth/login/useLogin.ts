import {
  sendOtpMutation,
  verifyCompanyOtpMutation,
  verifyOtpMutation,
} from "@/features/api/login";
import { useAuth } from "@/features/auth/useAuth";
import { setAuth } from "@/features/reducers/auth.reducer";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { useForm } from "react-hook-form";

const useLogin = () => {
  const dispatch = useDispatch();
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
      selectedCompanyId: data.companyId,
      mobile: countryCode + data.mobile,
      userType: data.userType,
    };

    companyVerifyOtp(verifyCompanyData, {
      onSuccess: (response) => {
        if (response?.status) {
          setToken(response?.data?.token, response?.data);
          console.log(response);

          dispatch(
            setAuth({
              token: response.data.token,
              isLoading: false,
              isAuthenticated: true,
              userId: response.data.employeeId,
            }),
          );
          reset();
          setCompanyModalOpen(false);
          setLoginDetails(null);
        }
      },
    });
  };

  const onSubmit = async (data: Login) => {
    setLoginDetails(data);

    if (!statusSentOtp) {
      sendOtp(
        { mobile: countryCode + data.mobile },
        {
          onSuccess: (response) => {
            setStatusSentOtp(response.status);
          },
        },
      );
    } else {
      verifyOtp(
        { mobile: countryCode + data.mobile, otp: data.otp },
        {
          onSuccess: (response) => {
            if (response.status) {
              const dataRes = response.data;
              if (Array.isArray(dataRes) && dataRes.length > 1) {
                setCompanies(dataRes);
                setCompanyModalOpen(true);
              } else if (!Array.isArray(dataRes)) {
                const token = dataRes.token;
                dispatch(
                  setAuth({
                    token: token,
                    isLoading: false,
                    isAuthenticated: true,
                    userId: dataRes.employeeId,
                  }),
                );
                setToken(token, dataRes);
                setLoginDetails(null);
              } else {
                throw new Error("No companies found.");
              }
            } else {
              throw new Error(response.message || "Invalid OTP");
            }
          },
        },
      );
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
    loginDetails,
  };
};

export default useLogin;
