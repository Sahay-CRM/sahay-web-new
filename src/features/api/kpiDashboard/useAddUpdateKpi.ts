import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type KpiUpdateData = {
  kpiId: string;
  startDate: string;
  endDate: string;
  data: string;
};

export default function useAddUpdateKpi() {
  const addUpdateKpi = useMutation({
    mutationKey: ["add-or-update-kpi"],
    mutationFn: async (data: KpiUpdateData[]) => {
      const payload = {
        dataArray: data,
      };
      const config = {
        url: Urls.addUpdateKpi(),
        data: payload,
      };
      const { data: resData } = await Api.post<designationResponse>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-kpi-dashboard-data"] });
      queryClient.resetQueries({ queryKey: ["get-kpi-dashboard-structure"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addUpdateKpi;
}
