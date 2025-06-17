import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
type DatePaging = CommonResponse<EmployeeData>;

export default function useDeleteEmployee() {
  const deleteEmployeeMutation = useMutation({
    mutationKey: ["delete-employee"],
    mutationFn: async (data: string) => {
      if (!data) {
        throw new Error("Something Went Wrong");
      }
      const { data: resData } = await Api.delete<DatePaging>({
        url: Urls.deleteEmployee(data),
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["get-employee-list"] });
      queryClient.resetQueries({ queryKey: ["dd-employee-Data"] });
    },
  });

  return deleteEmployeeMutation;
}
