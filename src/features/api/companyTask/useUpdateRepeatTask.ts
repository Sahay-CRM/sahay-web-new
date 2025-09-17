import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type DatePaging = BaseResponse<CompanyProjectDataProps>;

export default function useUpdateRepeatTask() {
  const updateRepeatTaskIdMutation = useMutation({
    mutationKey: ["add-or-update-task-list"],
    mutationFn: async (data: RepeatTaskAllRes) => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.updateRepeatTaskList(data.taskId!),
        data: data,
      });

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-allRepeatTaskList"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return updateRepeatTaskIdMutation;
}
