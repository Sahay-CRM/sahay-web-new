import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export interface ResetKpiPayload {
  kpiId: string;
  startDate: string;
  endDate: string;
  frequencyType: string;
}

type ResetKpiRes = CommonResponse<ResetKpiPayload>;

export default function useResetKpiValues() {
  const resetMutation = useMutation({
    mutationKey: ["reset-kpi-values"],
    mutationFn: async (data: ResetKpiPayload[]) => {
      if (data.length === 0) return { message: "No data to reset" };

      const { data: resData } = await Api.post<ResetKpiRes>({
        url: Urls.kpiResetValidation(),
        data: data,
      });

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "KPI data reset successfully");

      // refresh list
      queryClient.resetQueries({ queryKey: ["get-kpi-dashboard-data"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to reset KPI data");
    },
  });

  return resetMutation;
}
