import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";
// import { AxiosError } from "axios";

export default function useVerifyOtp() {
  const verifyOtpMutation = useMutation({
    mutationKey: ["verify-otp"],
    mutationFn: async (data: VerifyOtp) => {
      const { data: resData } = await Api.post({
        url: Urls.loginVerifyOtp(),
        data: {
          ...data,
        },
      });
      return resData;
    },
    // onError: (error) => {
    //   const axiosError = error as AxiosError<{ message?: string }>;
    //   console.log(axiosError);
    // },
  });
  return verifyOtpMutation;
}
