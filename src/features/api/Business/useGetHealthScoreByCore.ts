import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetHealthScoreByCore(id?: string) {
  const query = useQuery({
    queryKey: ["get-health-score-by-core-param-id", id], // ✅ Include id
    queryFn: async () => {
      const { data } = await Api.post<{ data: HealthScoreData[] }>({
        url: Urls.getHealthScoreByParam(id!),
      });
      return data;
    },
    enabled: !!id,
  });
  return query;
}
