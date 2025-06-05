import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type HealthRes = BaseResponse<HealthScoreResponse>;

export default function useGetHealthScore() {
  const query = useQuery({
    queryKey: ["get-healthScore-list"],
    queryFn: async () => {
      const { data: resData } = await Api.post<HealthRes>({
        url: Urls.getHealthScoreList(),
      });

      return resData;
    },
  });
  return query;
}
