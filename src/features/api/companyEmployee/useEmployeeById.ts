import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

// type EmployeeRes = BaseResponse<EmployeeDetailsById>;

export default function useGetEmployeeById({
  filter,
  enable,
}: FilterDataProps) {
  return useQuery({
    queryKey: ["get-employee-by-id", filter],
    queryFn: async () => {
      if (!filter.employeeId) {
        throw new Error("Employee ID is required");
      }
      const { data } = await Api.post<{ data: EmployeeDetailsById }>({
        url: Urls.getEmployeeById(filter.employeeId),
        data: filter,
      });
      return data;
    },
    enabled: !!enable || !!filter,
  });
}
