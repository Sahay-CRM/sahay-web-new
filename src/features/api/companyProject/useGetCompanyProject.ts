import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
type DatePaging = BaseResponse<CompanyProjectDataProps>;

export default function useGetCompanyProject({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-project-list-meeting", "get-project-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getAllCompanyProjectByPage(),
        data: {
          ...filter,
        },
      });

      return resData;
    },
    enabled: !!enable,
  });
  return query;
}
