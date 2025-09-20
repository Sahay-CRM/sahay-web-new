import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type CommentRes = CommonResponse<CommentResponse>;

interface CommentResponse {
  taskId: string;
}
interface AddUpdateTaskCommentPayload {
  taskId: string;
  comment: string;
  taskCommentId?: string;
}

export default function useAddUpdateTaskComment() {
  const addUpdateTaskCommentMutation = useMutation({
    mutationKey: ["add-or-update-task-comment"],
    mutationFn: async (data: AddUpdateTaskCommentPayload) => {
      const isUpdate = Boolean(data.taskCommentId);

      const config = {
        url: isUpdate
          ? Urls.updateTaskComment(data.taskCommentId!)
          : Urls.addTaskComment(),
        data,
      };

      const { data: resData } = await Api.post<CommentRes>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Comment saved successfully");
      queryClient.resetQueries({
        queryKey: ["get-task-comments"],
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to save comment");
    },
  });

  return addUpdateTaskCommentMutation;
}
