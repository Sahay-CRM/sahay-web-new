import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";


interface FilterProps {
  employeeId?: string;
  type?: "TASK" | "MEETING";
  refId?: string;
}

export default function useGetAllTimeLogs(filter: FilterProps, enable: boolean = true) {
  return useQuery({
    queryKey: ["get-all-time-logs", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: TimeLog[] }>({
        url: Urls.getAllTimeLogs(),
        data: filter,
      });
      return resData.data || [];
    },
    enabled: enable,
  });
}
