import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
// import { AxiosError } from "axios";

export default function useSendOtp() {
  const sendOtpMutation = useMutation({
    mutationKey: ["send-otp"],
    mutationFn: async (data: SendOtp) => {
      const { data: resData } = await Api.post<LoginResponse>({
        url: Urls.loginSendOtp(),
        data: {
          mobile: data.mobile,
        },
      });
      return resData;
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return sendOtpMutation;
}
