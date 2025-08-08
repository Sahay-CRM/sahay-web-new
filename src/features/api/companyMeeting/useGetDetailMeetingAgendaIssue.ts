import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

// type DatePaging = BaseResponse<DetailMeetingAgendaIssue>;

export default function useGetDetailMeetingAgendaIssue({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-detailMeetingAgendaIssue", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<{
        data: DetailMeetingAgendaIssue;
      }>({
        url: Urls.detailMeetingAgendaIssue(filter.detailMeetingAgendaIssueId),
      });

      return resData.data;
    },
    enabled: !!enable,
  });
  return query;
}
