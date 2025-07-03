import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
type DatePaging = BaseResponse<MeetingObjective>;

export default function useGetMeetingObjective({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-meeting-objective", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getMeetingAgendaObjective(),
        data: {
          ...filter,
        },
      });

      return resData;
    },
  });
  return query;
}
