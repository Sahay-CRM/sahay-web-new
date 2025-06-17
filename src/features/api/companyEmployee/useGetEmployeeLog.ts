import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

// Use 'unknown' as the type argument for ChangeLog to allow any data type safely

type UserLog = CommonResponse<ChangeLog<unknown>>;

export default function useGetEmployeeLog({ filter, enable }: FilterDataProps) {
  return useQuery({
    queryKey: ["employee-log", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<UserLog>({
        url: Urls.getUserLogById(),
        data: filter,
      });
      return resData.data;
    },
    enabled: !!enable && !!filter?.employeeId,
  });
}
