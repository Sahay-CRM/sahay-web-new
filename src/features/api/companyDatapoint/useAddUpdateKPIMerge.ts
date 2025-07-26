import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
// import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface AddUpdateKpiMergeRes {
  kpiMergeId?: string;
  kpiIds?: string[];
  tag?: string;
  unit?: string;
  visualFrequencyTypes?: string;
  visualFrequencyAggregate?: string;
}

type DatePaging = BaseResponse<KpiMergeRes>;

export default function useAddUpdateKPIMerge() {
  const addUpdateKpiMergeMutation = useMutation({
    mutationKey: ["add-or-update-Datapoint-list"],
    mutationFn: async (data: AddUpdateKpiMergeRes) => {
      const isUpdate = Boolean(data.kpiMergeId);

      const config = {
        url: isUpdate
          ? Urls.updateKPIMerge(data.kpiMergeId!)
          : Urls.createKPIMerge(),
        data: data,
      };

      const { data: resData } = isUpdate
        ? await Api.put<DatePaging>(config)
        : await Api.post<DatePaging>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      // queryClient.resetQueries({ queryKey: ["get-datapoint-list"] });
      // queryClient.resetQueries({ queryKey: ["get-datapoint-list-non-select"] });
      // queryClient.resetQueries({ queryKey: ["get-kpi-by-id"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addUpdateKpiMergeMutation;
}
