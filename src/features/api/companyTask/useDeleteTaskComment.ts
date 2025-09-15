import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";

type CommentRes = BaseResponse<TaskCommentData>;

export default function useDeleteTaskComment(taskId?: string) {
  const deleteCommentMutation = useMutation({
    mutationKey: ["delete-task-comment", taskId],
    mutationFn: async (commentId: string) => {
      if (!commentId) {
        throw new Error("Comment ID is required");
      }
      const { data: resData } = await Api.delete<CommentRes>({
        url: Urls.deleteTaskComment(commentId),
      });
      return resData;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Comment deleted successfully");
      queryClient.resetQueries({ queryKey: ["get-task-comments"] });
    },
  });

  return deleteCommentMutation;
}
