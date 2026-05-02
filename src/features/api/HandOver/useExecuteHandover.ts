import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export interface HandoverExecutePayload {
  oldUserId: string;
  newUserId: string;
}

interface HandoverExecuteData {
  success: boolean;
  message: string;
}

type HandoverRes = CommonResponse<HandoverExecuteData>;

export default function useExecuteHandover() {
  const executeHandover = useMutation({
    mutationKey: ["execute-handover"],
    mutationFn: async (payload: HandoverExecutePayload) => {
      const { data } = await Api.post<HandoverRes>({
        url: Urls.getHandoverDataById(),
        data: payload,
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Data handover completed successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  return executeHandover;
}
