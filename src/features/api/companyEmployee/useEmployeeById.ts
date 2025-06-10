import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

// type EmployeeRes = BaseResponse<EmployeeDetailsById>;

export default function useGetEmployeeById(id: string) {
  return useQuery({
    queryKey: ["get-employee-by-id", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Employee ID is required");
      }
      const { data } = await Api.post<{ data: EmployeeDetailsById }>({
        url: Urls.getEmployeeById(id),
      });
      return data;
    },
  });
}
