import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type EmployeeRes = BaseResponse<EmployeeDetails>;

export default function useDdEmployee() {
  return useQuery({
    queryKey: ["dd-employee-Data"],
    queryFn: async () => {
      const { data: resData } = await Api.post<EmployeeRes>({
        url: Urls.getEmployeeList(),
      });
      return resData.data;
    },
  });
}
