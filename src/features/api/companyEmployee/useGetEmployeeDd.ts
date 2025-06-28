import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

// type EmployeeRes = BaseResponse<EmployeeDetails>;

export default function useGetEmployeeDd() {
  return useQuery({
    queryKey: ["get-employee-list-dd"],
    queryFn: async () => {
      const { data } = await Api.post<{ data: EmployeeDetails[] }>({
        url: Urls.getAllEmployeeDd(),
      });
      return data;
    },
  });
}
