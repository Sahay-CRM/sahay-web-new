import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type DatePaging = CommonResponse<MeetingNotesRes>;

export default function useGetMeetingNotes(detailMeetingId: string) {
  const query = useQuery({
    queryKey: ["get-meeting-notes", detailMeetingId],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getMeetingNots(detailMeetingId),
      });

      return resData;
    },
    enabled: !!detailMeetingId,
  });
  return query;
}
