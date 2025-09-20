import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetAllTaskStatus({
  filter,
  enable,
}: FilterDataProps) {
  return useQuery({
    queryKey: ["get-all-task-status", filter],
    queryFn: async () => {
      const { data } = await Api.post<{ data: TaskStatusAllRes[] }>({
        url: Urls.getAllTaskTypeStatus(),
        data: filter,
      });
      return data;
    },
    enabled: !!enable || !!filter,
  });
}
