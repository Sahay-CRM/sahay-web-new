import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
type DatePaging = BaseResponse<CompanyProjectDataProps>;

export default function useGetCompanyProjectById(id: string) {
  const query = useQuery({
    queryKey: ["get-project-by-id", id],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getCompanyProjectById(id),
      });

      return resData;
    },
    enabled: !!id,
  });
  return query;
}
