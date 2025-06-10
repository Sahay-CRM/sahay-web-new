import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetDatapointById(id: string) {
  const query = useQuery({
    queryKey: ["get-kpi-by-id", id],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: KPIFormData }>({
        url: Urls.getKpiById(id),
      });

      return resData.data;
    },
    enabled: !!id,
    staleTime: 0,
  });
  return query;
}
