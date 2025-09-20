import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type DatePaging = BaseResponse<RepeatTaskAllRes>;

export default function useGetRepeatAllTask({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-allRepeatTaskList", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getRepeatTaskListDropdown(),
        data: {
          ...filter,
        },
      });

      return resData;
    },
    enabled: !!enable,
    staleTime: 0,
  });
  return query;
}
