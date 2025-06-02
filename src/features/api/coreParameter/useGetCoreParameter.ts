import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
type DatePaging = BaseResponse<CoreParameter>;

export default function useGetCoreParameter({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-core-parameter-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getCoreParameter(),
        data: {
          ...filter,
        },
      });

      return resData;
    },
  });
  return query;
}
