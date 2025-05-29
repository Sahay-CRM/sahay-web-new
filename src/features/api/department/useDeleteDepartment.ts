import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { AxiosError } from "axios";

export default function useDeleteDepartment() {
  const deleteDepartmentMutation = useMutation({
    mutationKey: ["delete-department"],
    mutationFn: async (data: DepartmentData) => {
      if (!data?.departmentId) {
        throw new Error("Department ID is required to delete a department.");
      }
      const { data: resData } = await Api.delete<DepartmentResponse>({
        url: Urls.deleteDepartment(data.departmentId),
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["get-department-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });

  return deleteDepartmentMutation;
}
