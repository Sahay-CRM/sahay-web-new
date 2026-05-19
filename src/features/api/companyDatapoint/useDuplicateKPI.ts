import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type DatePaging = BaseResponse<KPIFormDataProp>;

export default function useDuplicateKPI() {
  const duplicateKPIMutation = useMutation({
    mutationKey: ["duplicate-company-kpi"],
    mutationFn: async (data: {
      kpiId: string;
      employeeId: string;
      tag?: string;
    }) => {
      const config = {
        url: Urls.duplicateCompanyDatapoint(),
        data: data,
      };
      const { data: resData } = await Api.post<DatePaging>(config);
      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "KPI duplicated successfully");
      queryClient.resetQueries({ queryKey: ["get-datapoint-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to duplicate KPI");
    },
  });
  return duplicateKPIMutation;
}
