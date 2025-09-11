import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type meetingByIdProps = BaseResponse<CompanyMeetingDataProps>;

export default function useGetMeetingTiming(meetingId: string) {
  const query = useQuery({
    queryKey: ["get-meeting-details-timing", meetingId],
    queryFn: async () => {
      const { data: resData } = await Api.post<meetingByIdProps>({
        url: Urls.getDetailMeetingById(meetingId),
      });
      return resData;
    },
    enabled: !!meetingId,
  });
  return query;
}
