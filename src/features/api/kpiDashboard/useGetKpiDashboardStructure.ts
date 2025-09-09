import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

// interface KpiDashboardStructureParams {
//   sortBy?: string;
//   sortOrder?: "asc" | "desc";
// }

export default function useGetKpiDashboardStructure({
  filter,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-kpi-dashboard-structure", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<BaseResponse<FrequencyData>>({
        url: Urls.kpiStructureGet(),
        data: filter,
      });
      return resData;
    },
    staleTime: 0,
  });
  return query;
}
