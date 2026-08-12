import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useFinalSubmitDailyPlan() {
  return useMutation({
    mutationKey: ["final-submit-daily-plan"],
    mutationFn: async () => {
      const { data: resData } = await Api.post<DailyPlanResponse>({
        url: Urls.finalSubmitDailyPlan(),
      });
      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Plan submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["daily-plan"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to submit plan");
    },
  });
}
