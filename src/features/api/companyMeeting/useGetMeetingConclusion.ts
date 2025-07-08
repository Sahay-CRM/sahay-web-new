import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
interface MeetingProjectRes {
  detailMeetingProjectId: string;
  detailMeetingId: string;
  projectId: string;
}
type DatePaging = BaseResponse<MeetingProjectRes>;

export default function useGetMeetingConclusion(meetingId: string) {
  const query = useQuery({
    queryKey: ["get-meeting-Project-res", meetingId],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getMeetingProjectData(),
      });

      return resData.data;
    },
  });
  return query;
}
