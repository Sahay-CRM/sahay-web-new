import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useRemoveDailyPlanItem() {
  return useMutation({
    mutationKey: ["remove-daily-plan-item"],
    mutationFn: async (planItemId: string) => {
      const { data: resData } = await Api.post<DailyPlanResponse>({
        url: Urls.removeDailyPlanItem(planItemId),
      });
      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Item removed");
      queryClient.invalidateQueries({ queryKey: ["daily-plan"] });
      queryClient.invalidateQueries({ queryKey: ["get-all-task-dropdown"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to remove item");
    },
  });
}
