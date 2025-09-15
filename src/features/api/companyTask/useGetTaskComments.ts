import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface CommentResponse {
  data: TaskCommentData[];
}

export default function useGetTaskComments(taskId: string) {
  return useQuery<TaskCommentData[], AxiosError>({
    queryKey: ["get-task-comments", taskId],
    queryFn: async () => {
      const { data: resData } = await Api.post<CommentResponse>({
        url: Urls.getTaskComments(taskId),
      });

      return resData.data || [];
    },
    enabled: !!taskId,
  });
}
