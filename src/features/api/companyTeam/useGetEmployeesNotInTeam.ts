import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetEmployeesNotInTeam({ filter }: FilterDataProps) {
  return useQuery({
    queryKey: ["get-employees-not-in-team", filter],
    queryFn: async () => {
      const { data } = await Api.post<BaseResponse<EmployeeDetailsById>>({
        url: Urls.EmployeeGetByTeam(),
        data: filter || {},
      });
      return data;
    },
  });
}
