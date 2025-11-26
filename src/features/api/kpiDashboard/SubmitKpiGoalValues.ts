import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface KpiSubmitPayload {
  kpiId: string;
  startDate: string;
  endDate: string;
  validationValue1: string;
  validationValue2: string;
  frequencyType: string;
}

type KpiRes = CommonResponse<KpiSubmitPayload>;

export default function useSubmitKpiValues() {
  const kpiMutation = useMutation({
    mutationKey: ["submit-kpi-values"],
    mutationFn: async (data: KpiSubmitPayload[]) => {
      if (data.length === 0) return { message: "No changes to submit" };

      const { data: resData } = await Api.post<KpiRes>({
        url: Urls.kpiNewValidation(),
        data: data,
      });

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "KPI data submitted successfully");
      queryClient.resetQueries({ queryKey: ["get-kpi-dashboard-data"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to submit KPI data");
    },
  });

  return kpiMutation;
}
