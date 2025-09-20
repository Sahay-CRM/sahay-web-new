import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export default function useGetProjectComments(projectId: string) {
  const query = useQuery<ProjectComment[], AxiosError>({
    queryKey: ["get-project-comments", projectId],
    queryFn: async () => {
      const { data: resData } = await Api.post<CommentResponse>({
        url: Urls.getProjectComments(projectId),
      });

      return resData.data || [];
    },
  });

  return query;
}
