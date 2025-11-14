import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type UpdatesRes = BaseResponse<UpdateItem>;

export default function useGetUpdates() {
  const query = useQuery({
    queryKey: ["get-updates-list"],
    queryFn: async () => {
      const { data: resData } = await Api.get<UpdatesRes>({
        url: Urls.getUpdates(),
        data: {},
      });

      return resData;
    },
  });

  return query;
}
