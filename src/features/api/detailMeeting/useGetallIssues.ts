import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetallIssues({ enable = false }: { enable?: boolean }) {
  return useQuery({
    queryKey: ["getallIssues"],
    queryFn: async () => {
      const { data: resData } = await Api.post<BaseResponse<IssuesProps>>({
        url: Urls.getallIssues(),
        data: {
          isDelete: false,
        },
      });
      return resData;
    },
    enabled: enable,
  });
}
