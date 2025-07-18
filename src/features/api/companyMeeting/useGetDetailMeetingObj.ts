import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type DatePaging = BaseResponse<DetailMeetingObjectives>;

export default function useGetDetailMeetingObj({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-detail-meeting-obj-issue", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getDetailObjectivesIssue(),
        data: filter,
      });

      return resData;
    },
    enabled: !!enable,
  });
  return query;
}
