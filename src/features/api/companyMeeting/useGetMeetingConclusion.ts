import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetMeetingConclusion(meetingId: string) {
  const query = useQuery({
    queryKey: ["get-meeting-conclusion-res", meetingId],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: MeetingConclusionData }>(
        {
          url: Urls.getConclusionByMeeting(meetingId),
        },
      );

      return resData.data;
    },
    enabled: !!meetingId,
  });
  return query;
}
