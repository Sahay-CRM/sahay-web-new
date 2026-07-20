import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useCarryForwardDailyPlanItem() {
  return useMutation({
    mutationKey: ["carry-forward-daily-plan-item"],
    mutationFn: async (data: CarryForwardDailyPlanItemPayload) => {
      const { data: resData } = await Api.post<DailyPlanResponse>({
        url: Urls.carryForwardDailyPlanItem(data.planItemId),
        data,
      });
      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Item carried forward");
      queryClient.invalidateQueries({ queryKey: ["daily-plan"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to carry forward item");
    },
  });
}
