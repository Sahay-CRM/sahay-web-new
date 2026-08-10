import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export interface CheckOutPayload {
  timeLogId?: string;
  checkinDate: string;
  checkoutTime: string;
  isFinalSubmit: boolean;
  dayRating?: number;
  remark?: string;
  items: {
    planItemId?: string;
    taskId?: string;
    meetingId?: string;
    planTime?: number;
    actualTime: number;
    remarks?: string;
    isPlaned: boolean;
  }[];
}

export interface DailyPlanSubmitResponse {
  success: boolean;
  status: number;
  message: string;
  data?: unknown;
}

export default function useCheckOutDailyPlan() {
  return useMutation({
    mutationKey: ["check-out-daily-plan"],
    mutationFn: async (payload: CheckOutPayload) => {
      const { data: resData } = await Api.post<DailyPlanSubmitResponse>({
        url: Urls.checkOutDailyPlan(),
        data: payload,
      });
      return resData;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Check-out submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["daily-plan"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to submit check-out");
    },
  });
}
