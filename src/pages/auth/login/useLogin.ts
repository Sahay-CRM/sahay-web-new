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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_loginDetails, setLoginDetails] = useState<Login | null>(null);
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
      mobile: data.mobile,
      userType: data.userType,
    };

    companyVerifyOtp(verifyCompanyData, {
      onSuccess: (response) => {
        if (response?.status) {
          setToken(response?.data?.token, response?.data);
          dispatch(
            setAuth({
              token: response.data.token,
              isLoading: false,
              isAuthenticated: true,
              user: response.data,
            }),
          );
          reset();
          setCompanyModalOpen(false);
          setLoginDetails(null);
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
      };

      sendOtp(sendData, {
        onSuccess: (response) => {
          setStatusSentOtp(response.status);
        },
      });
    } else {
      const verifyData = {
        mobile: countryCode + data.mobile,
        otp: data.otp,
      };

      verifyOtp(verifyData, {
        onSuccess: (response) => {
          if (response.status) {
            const data = response.data;
            if (Array.isArray(data) && data.length > 1) {
              setCompanies(data);
              setCompanyModalOpen(true);
            } else if (!Array.isArray(data)) {
              const token = data.token;
              dispatch(
                setAuth({
                  token: token,
                  isLoading: false,
                  isAuthenticated: true,
                  user: data,
                }),
              );
              setToken(token, data);
              setLoginDetails(null);
            } else {
              throw new Error("No companies found.");
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
