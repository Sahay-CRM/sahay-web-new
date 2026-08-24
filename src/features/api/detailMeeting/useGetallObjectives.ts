import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetallObjectives({ enable = false }: { enable?: boolean }) {
  return useQuery({
    queryKey: ["getallObjectives"],
    queryFn: async () => {
      const { data: resData } = await Api.post<BaseResponse<ObjectiveProps>>({
        url: Urls.getallObjectives(),
        data: {
          isDelete: false,
        },
      });
      return resData;
    },
    enabled: enable,
  });
}
