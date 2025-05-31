import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
type DatePaging = BaseResponse<CompanyProjectDataProps>;

export default function useGetSubparameter({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-sub-parameter-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getAllSubParameter(),
        data: {
          ...filter,
        },
      });

      return resData;
    },
  });
  return query;
}
