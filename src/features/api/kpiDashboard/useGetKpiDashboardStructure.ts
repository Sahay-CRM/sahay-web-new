import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetKpiDashboardStructure() {
  const query = useQuery({
    queryKey: ["get-kpi-dashboard-structure"],
    queryFn: async () => {
      const { data: resData } = await Api.post<BaseResponse<FrequencyData>>({
        url: Urls.kpiStructureGet(),
      });

      return resData;
    },
    staleTime: 0,
  });
  return query;
}
