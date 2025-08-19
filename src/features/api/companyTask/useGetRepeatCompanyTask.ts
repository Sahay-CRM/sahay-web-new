import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type DatePaging = BaseResponse<TaskGetPaging>;

export default function useGetRepeatCompanyTask({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-task-listrepeat", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getAllRepeatCompanyTaskByPage(),
        data: {
          ...filter,
        },
      });

      return resData;
    },
    enabled: enable,
  });
  return query;
}
