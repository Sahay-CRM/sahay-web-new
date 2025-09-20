import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type EmployeeRes = BaseResponse<EmployeeDetails>;

export default function useGetEmployee({ filter, enable }: FilterDataProps) {
  return useQuery({
    queryKey: ["get-employee-list", filter],
    queryFn: async () => {
      const { data } = await Api.post<EmployeeRes>({
        url: Urls.getEmployeeList(),
        data: filter,
      });
      return data;
    },
    enabled: !!enable || !!filter,
  });
}
