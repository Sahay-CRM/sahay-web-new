import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";
type DatePaging = BaseResponse<KPIFormData>;

export default function useGetAvailableKpis() {
  return useMutation({
    mutationFn: async (data: { kpiMergeId: string; kpiMasterId: string }) => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getNonSelectKpiList(),
        data,
      });
      return resData;
    },
  });
}
