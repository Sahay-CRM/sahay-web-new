import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useTeamById(id: string, enable?: boolean) {
  return useQuery({
    queryKey: ["get-team-by-id", id],
    queryFn: async () => {
      const { data } = await Api.get<CommonResponse<Team>>({
        url: Urls.teamGetById(id),
      });

      return data;
    },
    enabled: !!id && enable !== false,
  });
}
