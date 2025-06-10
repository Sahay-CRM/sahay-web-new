import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { AxiosError } from "axios";
type DatePaging = BaseResponse<CompanyProjectDataProps>;

export default function useDeleteCompanyTask() {
  const deleteCompanyTaskMutation = useMutation({
    mutationKey: ["delete-company-task"],
    mutationFn: async (data: CompanyProjectDataProps) => {
      if (!data?.projectId) {
        throw new Error("Something Went Wrong");
      }
      const { data: resData } = await Api.delete<DatePaging>({
        url: Urls.deleteCompanyTask(data.projectId),
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["get-task-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });

  return deleteCompanyTaskMutation;
}
