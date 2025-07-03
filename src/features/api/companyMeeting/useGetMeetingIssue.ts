import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type DatePaging = BaseResponse<MeetingIssue>;

export default function useGetMeetingIssue({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-meeting-issue", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getMeetingAgendaIssue(),
        data: {
          ...filter,
        },
      });

      return resData;
    },
  });
  return query;
}
