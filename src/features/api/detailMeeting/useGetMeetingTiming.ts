import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetMeetingTiming(meetingId: string) {
  const query = useQuery({
    queryKey: ["get-meeting-details-timing", meetingId],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: MeetingDetailsTiming }>({
        url: Urls.getDetailMeetingById(meetingId),
      });
      return resData.data;
    },
    enabled: !!meetingId,
  });
  return query;
}
