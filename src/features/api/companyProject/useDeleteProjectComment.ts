import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";

type CommentRes = BaseResponse<ProjectComment>;

export default function useDeleteProjectComment(projectId?: string) {
  const deleteCommentMutation = useMutation({
    mutationKey: ["delete-project-comment", projectId],
    mutationFn: async (commentId: string) => {
      if (!commentId) {
        throw new Error("Comment ID is required");
      }
      const { data: resData } = await Api.delete<CommentRes>({
        url: Urls.deleteProjectComment(commentId),
      });
      return resData;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Comment deleted successfully");
      queryClient.resetQueries({ queryKey: ["get-project-comments"] });
    },
  });

  return deleteCommentMutation;
}
