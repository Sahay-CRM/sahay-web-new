import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

interface MeetingSummaryResponse {
  data: {
    summary: {
      added: SummaryAddedItem[];
      updated: SummaryUpdatedItem[];
      removed: SummaryRemovedItem[];
    };
  };
  success?: boolean;
  message?: string;
}

export default function useGetMeetingSummary(meetingId?: string) {
  const query = useQuery({
    queryKey: ["get-meeting-summary", meetingId],
    queryFn: async () => {
      if (!meetingId) return null;
      const { data: resData } = await Api.post<MeetingSummaryResponse>({
        url: Urls.getMeetingSummary(meetingId),
      });
      return resData;
    },
    enabled: !!meetingId,
  });
  return query;
}
