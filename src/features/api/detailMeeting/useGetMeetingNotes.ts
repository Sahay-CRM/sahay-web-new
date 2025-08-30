import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type DatePaging = CommonResponse<MeetingNotesRes>;

export default function useGetMeetingNotes({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-meeting-notes", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getMeetingnotes(filter.meetingId),
        data: filter,
      });

      return resData;
    },
    enabled: !!enable,
  });
  return query;
}
