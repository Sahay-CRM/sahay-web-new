import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type DatePaging = BaseResponse<MeetingAgenda>;

export default function useGetRepeatMeetingIo({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-repeat-meeting-obj-issue", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getRepeatMeetingAgendaIo(),
        data: filter,
      });

      return resData.data;
    },
    enabled: !!enable,
  });
  return query;
}
