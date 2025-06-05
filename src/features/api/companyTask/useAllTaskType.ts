import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useAllTaskType({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-all-taskType-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: TaskTypeData }>({
        url: Urls.AllTaskTypeList(),
        data: filter,
      });

      return resData;
    },
  });
  return query;
}
