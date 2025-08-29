import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

interface KpiDashboardStructureParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export default function useGetKpiDashboardStructure({
  sortBy,
  sortOrder,
}: KpiDashboardStructureParams = {}) {
  const query = useQuery({
    queryKey: ["get-kpi-dashboard-structure", { sortBy, sortOrder }],
    queryFn: async () => {
      const { data: resData } = await Api.post<BaseResponse<FrequencyData>>({
        url: Urls.kpiStructureGet(),
        data: {
          sortBy: sortBy,
          sortOrder: sortOrder,
        },
      });
      return resData;
    },
    staleTime: 0,
  });
  return query;
}
