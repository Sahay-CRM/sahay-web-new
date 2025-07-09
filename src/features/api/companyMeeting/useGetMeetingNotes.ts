import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type DatePaging = CommonResponse<MeetingNotesRes>;

export default function useGetMeetingNotes(meetingId: string) {
  const query = useQuery({
    queryKey: ["get-meeting-notes", meetingId],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getMeetingNots(meetingId),
      });

      return resData;
    },
    enabled: !!meetingId,
  });
  return query;
}
