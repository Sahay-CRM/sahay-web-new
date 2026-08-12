import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export interface CheckInPayload {
  checkinDate: string;
  submitTime: string;
  isFinalSubmit: boolean;
  isAutoSubmit: boolean;
  items?: {
    taskId?: string;
    meetingId?: string;
    planTime: number;
    remarks: string;
    sequence: number;
    isPlaned: boolean;
  }[];
}

export interface DailyPlanSubmitResponse {
  success: boolean;
  status: number;
  message: string;
  data?: unknown;
}

export default function useCheckInDailyPlan() {
  return useMutation({
    mutationKey: ["check-in-daily-plan"],
    mutationFn: async (payload: CheckInPayload) => {
      const { data: resData } = await Api.post<DailyPlanSubmitResponse>({
        url: Urls.checkInDailyPlan(),
        data: payload,
      });
      return resData;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Check-in submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["daily-plan"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to submit check-in");
    },
  });
}
