import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
type DatePaging = BaseResponse<CompanyProjectDataProps>;

export default function useGetProjectStatus({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-project-status-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getAllProjectStatus(),
        data: {
          ...filter,
        },
      });

      return resData;
    },
  });
  return query;
}
