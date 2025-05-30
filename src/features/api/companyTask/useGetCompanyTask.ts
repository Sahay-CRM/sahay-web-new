import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
type DatePaging = BaseResponse<CompanyProjectDataProps>;

export default function useGetCompanyTask(filter: PaginationFilter) {
  const query = useQuery({
    queryKey: ["get-task-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getAllCompanyTaskByPage(),
        data: {
          ...filter,
        },
      });

      return resData;
    },
  });
  return query;
}
