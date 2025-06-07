import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

// Replace 'DataType' with the actual expected type of 'data'
export default function useGetKpiDashboardData(data: Record<string, unknown>) {
  const query = useQuery({
    queryKey: ["get-kpi-dashboard-data", data],
    queryFn: async () => {
      const response = await Api.post<{ data: FrequencyData[] }>({
        url: Urls.kpiDataGet(),
        data: data,
      });
      return response.data;
    },
    enabled: !!data,
    staleTime: 0,
  });

  return query;
}
