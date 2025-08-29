import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function useGetMeetingConclusion({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-meeting-conclusion-res", filter],
    queryFn: async () => {
      // wait 2 seconds before calling API
      await delay(2000);

      const { data: resData } = await Api.post<{
        data: MeetingConclusionData;
      }>({
        url: Urls.getConclusionByMeeting(filter.meetingId),
      });

      return resData.data;
    },
    enabled: !!enable,
  });

  return query;
}
