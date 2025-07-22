import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type IssueRes = BaseResponse<IssuesProps>;

export default function useGetMeetingDetail({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-meeting-detail-type", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<IssueRes>({
        url: Urls.getIssues(),
        data: {
          ...filter,
        },
      });

      return resData;
    },
  });
  return query;
}
