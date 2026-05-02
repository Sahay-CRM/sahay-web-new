import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type RequestMasterByPage = BaseResponse<RequestMasterData>;

export default function useGetRequestMaster({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["getRequestMasterDataList", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<RequestMasterByPage>({
        url: Urls.getRequestCompany(),
        data: filter,
      });

      return resData;
    },
    staleTime: 0,
    enabled: !!enable || !!filter,
  });

  return query;
}
