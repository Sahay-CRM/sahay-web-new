import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export interface HandoverPartialExecutePayload {
  oldUserId: string;
  newUserId: string;
  moduleKey: string[];
}

interface HandoverExecuteData {
  success: boolean;
  message: string;
}

type HandoverRes = CommonResponse<HandoverExecuteData>;

export default function useExecutePartialHandover() {
  const executePartialHandover = useMutation({
    mutationKey: ["execute-partial-handover"],
    mutationFn: async (payload: HandoverPartialExecutePayload) => {
      const { data } = await Api.post<HandoverRes>({
        url: Urls.executePartialHandover(),
        data: payload,
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(
        res.message || "Partial data handover completed successfully",
      );
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  return executePartialHandover;
}
