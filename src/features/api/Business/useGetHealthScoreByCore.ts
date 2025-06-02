import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetHealthScoreByCore({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-health-score-by-core-param-id", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: HealthScoreData[] }>({
        url: Urls.getHealthScoreByParam(),
        data: filter,
      });
      return resData.data;
    },
    enabled: !!filter.coreParameterId && !!filter.levelId,
  });
  return query;
}
