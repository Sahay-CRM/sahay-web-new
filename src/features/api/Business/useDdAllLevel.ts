import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useDdAllLevel() {
  return useQuery({
    queryKey: ["dd-all-levels"],
    queryFn: async () => {
      const { data } = await Api.post<{ data: LevelDataProps[] }>({
        url: Urls.ddLevelsListAll(),
      });
      return data;
    },
  });
}
