import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type DatePaging = CommonResponse<RepeatMeetingNotesRes>;

export default function useGetRepeatMeetingNotes({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-repeatMeeting-notes", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getRepeatMeetingNotes(),
        data: filter,
      });

      return resData;
    },
    enabled: !!enable,
  });
  return query;
}
