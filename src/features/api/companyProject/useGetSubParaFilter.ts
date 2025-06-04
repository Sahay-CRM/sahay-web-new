import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type DatePaging = BaseResponse<CompanyProjectDataProps>;

export default function useGetSubParaFilter({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-sub-parameter-filter", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.subParameterByFilter(),
        data: {
          ...filter,
        },
      });

      return resData;
    },
  });
  return query;
}
