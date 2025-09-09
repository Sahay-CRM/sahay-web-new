import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type RequestByPage = BaseResponse<CreateRequest>;

export default function useGetRequest({ filter, enable }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["getRequestDataList", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<RequestByPage>({
        url: Urls.getRequest(),
        data: filter,
      });

      return resData;
    },
    enabled: !!enable || !!filter,
  });

  return query;
}
