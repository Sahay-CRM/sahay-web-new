import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type DatePaging = BaseResponse<MeetingAgenda>;

export default function useGetDetailMeetingAgenda({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-detail-meeting-agenda-issue-obj", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getMeetingAgendaObjective(),
        data: {
          detailMeetingId: "850f4e12-d858-4e33-8a76-68259377d9de",
        },
      });

      return resData.data;
    },
    enabled: !!enable,
  });
  return query;
}
