import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetTeam({ filter, enable }: FilterDataProps) {
  return useQuery({
    queryKey: ["get-team-list", filter],
    queryFn: async () => {
      const { data } = await Api.post<PagingTeam>({
        url: Urls.getTeam(),
        data: filter,
      });
      return data;
    },
    enabled: !!enable || !!filter,
  });
}
