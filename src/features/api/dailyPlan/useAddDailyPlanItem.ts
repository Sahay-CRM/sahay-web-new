import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useAddDailyPlanItem() {
  return useMutation({
    mutationKey: ["add-daily-plan-item"],
    mutationFn: async (data: AddDailyPlanItemPayload) => {
      const { data: resData } = await Api.post<DailyPlanResponse>({
        url: Urls.addDailyPlanItem(),
        data,
      });
      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Item added to plan");
      queryClient.invalidateQueries({ queryKey: ["daily-plan"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to add item");
    },
  });
}
