// import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
// import { toast } from "react-toastify";
// import { useAuth } from "~/context/AuthProvider";
// import { baseUrl } from "~/utils/app.utils";

const useLogin = () => {
  // const [loading, setLoading] = useState(false);
  // const [statusSentOtp, setStatusSentOtp] = useState(false);
  // const [number, setNumber] = useState(null);
  // const [companies, setCompanies] = useState([]); // Store multiple companies
  // const [isCompanyModalOpen, setCompanyModalOpen] = useState(false); // Modal state
  // const [loginDetails, setLoginDetails] = useState(false); // Modal state
  const [countryCode, setCountryCode] = useState("+91");
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
    reset,
    control,
  } = useForm();

  // const sendOtpApi = async (mobileNumber, userType) => {
  //   setNumber(mobileNumber); // Save the number to state for later use
  //   setLoading(true);
  //   try {
  //     const response = await axios.post(`${baseUrl}/auth/login`, {
  //       mobile: `${mobileNumber}`,
  //       userType: userType,
  //     });
  //     // Check if the response indicates success
  //     if (response.data?.status) {
  //       setStatusSentOtp(true); // Update OTP status
  //       setNumber(mobileNumber); // Save mobile number to state
  //       toast.success(response.data.message || "OTP sent successfully!");
  //     } else {
  //       throw new Error(response.data?.message || "Failed to send OTP"); // Throw error for invalid status
  //     }
  //     setLoading(false);
  //   } catch (err) {
  //     setLoading(false);
  //     toast.error(
  //       err.response?.data?.message || err.message || "Failed to send OTP"
  //     );
  //   }
  // };

  // const verifyOtpApi = async (data) => {
  //   setLoading(true);
  //   try {
  //     // API call to verify the OTP
  //     const response = await axios.post(`${baseUrl}/verify-otp`, {
  //       mobile: `${number}`, // Use the stored mobile number
  //       otp: data.otp, // OTP entered by the user
  //       userType: data?.userType?.value ? data.userType.value : "",
  //     });
  //     if (response.data?.status) {
  //       const companiesList = response.data?.companies || []; // Assuming "companies" key in response
  //       if (companiesList?.length > 1) {
  //         setCompanies(companiesList);
  //         setCompanyModalOpen(true); // Open modal to select a company
  //       } else {
  //         // setToken(response.data.user.token, response.data.user); // Save the token to context/storage
  //         // toast.success(response.data?.message || 'OTP verified successfully!');
  //         setLoginDetails(null);
  //       }
  //     } else {
  //       throw new Error(response.data?.message || "Invalid OTP");
  //     }
  //     setLoading(false);
  //   } catch (err) {
  //     setLoading(false);
  //     toast.error(
  //       err.response?.data?.message || err.message || "Failed to verify OTP"
  //     ); // Show the error message
  //   }
  // };

  const handleLogin = async () => {
    // setLoading(true); // Show loading spinner
    // try {
    //   const response = await axios.post(`${baseUrl}/auth/select-company`, {
    //     companyId: company.companyId,
    //     consultantId: company.consultantId,
    //     mobile: loginDetails?.mobile || company?.loginDetails?.mobile,
    //     userType:
    //       loginDetails?.userType?.value ||
    //       company?.loginDetails?.userType?.value,
    //   });
    //   if (response.data?.status) {
    //     setToken(response.data.user.token, response.data.user);
    //     toast.success("Login successful!");
    //     reset();
    //     setCompanyModalOpen(false);
    //     setLoginDetails(null);
    //     if (company?.isReload) {
    //       setTimeout(() => {
    //         window.location.href = window.location.href;
    //       }, 500);
    //     }
    //   } else {
    //     throw new Error(response.data?.message || "Failed to select company");
    //   }
    // } catch (err) {
    //   // Handle errors during company selection
    //   toast.error(
    //     err.response?.data?.message || err.message || "Failed to select company"
    //   );
    // } finally {
    //   setLoading(false);
    // }
  };

  const onSubmit = async () => {
    // setLoginDetails({ ...data, mobile: countryCode + data.mobile });
    // let mobileNum = countryCode + data.mobile;
    // if (!statusSentOtp) {
    //   // Sending OTP
    //   if (!mobileNum) {
    //     setFormError("mobile", {
    //       type: "required",
    //       message: "Mobile number is required",
    //     });
    //     return;
    //   }
    //   await sendOtpApi(mobileNum, data?.userType?.value);
    // } else {
    //   // Verifying OTP
    //   if ((!data.otp || data.otp.length < 4) && statusSentOtp) {
    //     setFormError("otp", {
    //       type: "required",
    //       message: "OTP is required",
    //     });
    //     return;
    //   }
    //   const isOtpVerified = await verifyOtpApi(data);
    //   if (isOtpVerified) reset(); // Reset the form on success
    // }
  };

  const handleFormSubmit = handleSubmit(onSubmit);

  return {
    register,
    handleFormSubmit,
    errors,
    // loading,
    // statusSentOtp,
    trigger,
    setValue,
    control,
    // companies,
    // isCompanyModalOpen,
    handleLogin,
    countryCode,
    setCountryCode,
    // setCompanyModalOpen,
    reset,
  };
};

export default useLogin;
