import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type EmpRes = CommonResponse<TaskGetPaging>;

export default function useAddUpdateRepeatTaskStatus() {
  const addUpdateRepeatTaskStatusMutation = useMutation({
    mutationKey: ["add-or-update-repeatTask-status"],
    mutationFn: async (repetitiveTaskId: string) => {
      const { data: resData } = await Api.post<EmpRes>({
        url: Urls.updateRepeatCompanyTaskStatus(repetitiveTaskId),
      });

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "successful");
      queryClient.resetQueries({ queryKey: ["get-task-listrepeat"] });
      queryClient.resetQueries({ queryKey: ["get-repeattask-by-id"] });
      queryClient.resetQueries({ queryKey: ["dd-task-type"] });
      queryClient.resetQueries({ queryKey: ["get-allRepeatTaskList"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addUpdateRepeatTaskStatusMutation;
}
