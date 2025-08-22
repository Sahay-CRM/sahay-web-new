import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetMeetingConclusionTime({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-meeting-conclusion-time-by-meetingId", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<{
        data: MeetingConclusionData;
      }>({
        url: Urls.getConclusionTime(filter.meetingId),
      });

      return resData.data;
    },
    enabled: !!enable,
  });
  return query;
}
