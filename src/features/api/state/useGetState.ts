import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetState({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-state-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<StateResponse>({
        url: Urls.getStateList(),
        data: {
          ...filter,
        },
      });
      return resData;
    },
    enabled: !!filter,
  });
  return query;
}
