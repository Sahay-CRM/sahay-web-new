import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useDdTaskType({ filter, enable }: FilterDataProps) {
  return useQuery({
    queryKey: ["dd-task-type", filter],
    queryFn: async () => {
      const { data } = await Api.post<{ data: TaskTypeData[] }>({
        url: Urls.ddTaskType(),
        data: filter,
      });
      return data;
    },
    enabled: !!enable || !!filter,
  });
}
