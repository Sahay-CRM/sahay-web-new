import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type CommentRes = CommonResponse<CommentResponse>;

interface CommentResponse {
  projectId: string;
}
export interface AddUpdateCommentPayload {
  projectId: string;
  comment: string;
  projectCommentId?: string;
}

export default function useAddUpdateProjectComment() {
  const addUpdateCommentMutation = useMutation({
    mutationKey: ["add-or-update-project-comment"],
    mutationFn: async (data: AddUpdateCommentPayload) => {
      const isUpdate = Boolean(data.projectCommentId);

      const config = {
        url: isUpdate
          ? Urls.updateProjectComment(data.projectCommentId!)
          : Urls.addProjectComment(),
        data,
      };

      const { data: resData } = isUpdate
        ? await Api.post<CommentRes>(config)
        : await Api.post<CommentRes>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Comment saved successfully");
      queryClient.resetQueries({
        queryKey: ["get-project-comments"],
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to save comment");
    },
  });

  return addUpdateCommentMutation;
}
