import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export interface AddTimeLogPayload {
  employeeId: string;
  type: "TASK" | "MEETING" | "GANTT";
  refId?: string;
  startHours: string;
  endHours: string;
  note: string;
  date: string;
}

export default function useAddTimeLog() {
  return useMutation({
    mutationKey: ["add-time-log"],
    mutationFn: async (payload: AddTimeLogPayload) => {
      const { data: resData } = await Api.post<CommonResponse<TimeLog>>({
        url: Urls.addTimeLog(),
        data: payload,
      });
      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Time log added successfully");
      queryClient.invalidateQueries({ queryKey: ["get-all-time-logs"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to add time log");
    },
  });
}
