import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
import useDebounce from "@/hooks/useDebounce";

interface MeetingSearchItem {
  meetingId: string;
  meetingName: string;
  isDetailMeeting: boolean | null;
}

interface MeetingSearchResponse {
  normal: MeetingSearchItem[];
  detail: MeetingSearchItem[];
}

export default function useGetMeetingSearch(searchTerm: string) {
  const debouncedSearch = useDebounce(searchTerm, 500);

  return useQuery({
    queryKey: ["get-meeting-search", debouncedSearch],
    queryFn: async () => {
      const { data } = await Api.post<{
        data: MeetingSearchResponse;
      }>({
        url: Urls.getMeetingSearch(),
        data: { search: debouncedSearch || "" },
      });
      return data;
    },
  });
}
