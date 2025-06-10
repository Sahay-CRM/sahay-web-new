import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetEmployeeLog({ filter, enable }: FilterDataProps) {
  return useQuery({
    queryKey: ["employee-log", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: UserLogDetails[] }>({
        url: Urls.getUserLogById(),
        data: filter,
      });
      return resData.data;
    },
    enabled: !!enable && !!filter?.employeeId,
  });
}
