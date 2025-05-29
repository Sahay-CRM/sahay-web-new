import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type DesignationRes = BaseResponse<EmployeeDetails>;

export default function useGetCompany({
  filter,
}: {
  filter: PaginationFilter;
}) {
  return useQuery({
    queryKey: ["get-employee-list", filter],
    queryFn: async () => {
      const { data } = await Api.post<DesignationRes>({
        url: Urls.getEmployeeList(),
        data: filter,
      });
      return data;
    },
    enabled: !!filter,
  });
}
