import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
type DatePaging = BaseResponse<CompanyProjectDataProps>;

export default function useGetCompanyTaskById(id: string) {
  const query = useQuery({
    queryKey: ["get-task-by-id", id],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getCompanyTaskById(id),
      });

      return resData;
    },
  });
  return query;
}
