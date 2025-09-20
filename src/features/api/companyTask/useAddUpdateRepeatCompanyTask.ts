import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type DatePaging = BaseResponse<CompanyProjectDataProps>;

export default function useAddUpdateRepeatCompanyTask() {
  const addUpdateRepeatCompanyTaskMutation = useMutation({
    mutationKey: ["add-or-update-task-list"],
    mutationFn: async (data: AddUpdateTask) => {
      const config = {
        url: data.repetitiveTaskId
          ? Urls.updateRepeatCompanyTask(data.repetitiveTaskId!)
          : Urls.addRepeatCompanyTask(),
        data: data,
      };
      const { data: resData } = data.repetitiveTaskId
        ? await Api.post<DatePaging>(config)
        : await Api.post<DatePaging>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-task-listrepeat"] });
      queryClient.resetQueries({ queryKey: ["get-repeattask-by-id"] });
      queryClient.resetQueries({ queryKey: ["dd-task-type"] });
      queryClient.resetQueries({ queryKey: ["get-allRepeatTaskList"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addUpdateRepeatCompanyTaskMutation;
}
