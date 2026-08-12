import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type DatePaging = BaseResponse<CompanyProjectDataProps>;

export default function useAddUpdateCompanyTask() {
  const addUpdateCompanyTaskMutation = useMutation({
    mutationKey: ["add-or-update-task-list"],
    mutationFn: async (data: AddUpdateTask) => {
      const { taskId, ...rest } = data;
      const config = {
        url: taskId
          ? Urls.updateCompanyTask(taskId)
          : Urls.addCompanyTask(),
        data: taskId ? rest : data,
      };
      const { data: resData } = taskId
        ? await Api.put<DatePaging>(config)
        : await Api.post<DatePaging>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-task-list"] });
      queryClient.resetQueries({ queryKey: ["get-task-by-id"] });
      queryClient.resetQueries({ queryKey: ["dd-task-type"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addUpdateCompanyTaskMutation;
}
