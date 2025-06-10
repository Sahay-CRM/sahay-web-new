import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetKpiDashboardData({
  enable,
  filter,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-kpi-dashboard-data", filter],
    queryFn: async () => {
      const response = await Api.post<{ data: KpiDataCell[][] }>({
        url: Urls.kpiDataGet(),
        data: filter,
      });

      return response.data;
    },
    enabled: !!enable,
    staleTime: 0,
  });

  return query;
}
