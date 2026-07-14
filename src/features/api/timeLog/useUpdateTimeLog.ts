import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export interface UpdateTimeLogPayload {
  timeLogId: string;
  startHours?: number;
  endHours?: number;
  note?: string;
  date?: string;
  type?: "TASK" | "MEETING";
  refId?: string;
}

export default function useUpdateTimeLog() {
  return useMutation({
    mutationKey: ["update-time-log"],
    mutationFn: async ({ timeLogId, ...payload }: UpdateTimeLogPayload) => {
      const { data: resData } = await Api.post<CommonResponse<TimeLog>>({
        url: Urls.updateTimeLog(timeLogId),
        data: payload,
      });
      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Time log updated successfully");
      queryClient.invalidateQueries({ queryKey: ["get-all-time-logs"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update time log");
    },
  });
}
