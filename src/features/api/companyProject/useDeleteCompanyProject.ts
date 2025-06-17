import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
type DatePaging = BaseResponse<CompanyProjectDataProps>;

export default function useDeleteCompanyProject() {
  const deleteCompanyProjectMutation = useMutation({
    mutationKey: ["delete-company-project"],
    mutationFn: async (projectId: string) => {
      if (!projectId) {
        throw new Error("Something Went Wrong");
      }
      const { data: resData } = await Api.delete<DatePaging>({
        url: Urls.deleteCompanyProject(projectId),
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["get-project-by-id"] });
      queryClient.resetQueries({ queryKey: ["get-project-list"] });
    },
  });

  return deleteCompanyProjectMutation;
}
