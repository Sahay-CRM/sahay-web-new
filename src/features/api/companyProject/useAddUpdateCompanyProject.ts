import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type DatePaging = BaseResponse<CompanyProjectDataProps>;

export default function useAddUpdateCompanyProject() {
  const addUpdateCompanyProjectMutation = useMutation({
    mutationKey: ["add-or-update-project-list"],
    mutationFn: async (data: CompanyProjectDataProps) => {
      const isUpdate = Boolean(data.projectId);

      const config = {
        url: isUpdate
          ? Urls.updateCompanyProject(data.projectId!)
          : Urls.addCompanyProject(),
        data: data,
      };

      // Send request
      const { data: resData } = isUpdate
        ? await Api.put<DatePaging>(config)
        : await Api.post<DatePaging>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-project-list"] });
      queryClient.resetQueries({ queryKey: ["get-project-by-id"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  return addUpdateCompanyProjectMutation;
}
