import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";
// import { AxiosError } from "axios";

export default function useSendOtp() {
  const sendOtpMutation = useMutation({
    mutationKey: ["send-otp"],
    mutationFn: async (data: SendOtp) => {
      const { data: resData } = await Api.post<LoginResponse>({
        url: Urls.loginSendOtp(),
        data: {
          mobile: data.mobile,
          userType: data.userType,
        },
      });
      return resData;
    },
    onError: () => {
      // const axiosError = error as AxiosError<{ message?: string }>;
      // console.log(axiosError);
    },
  });
  return sendOtpMutation;
}
