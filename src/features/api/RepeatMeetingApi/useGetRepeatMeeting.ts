import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type DatePaging = BaseResponse<RepeatMeeting>;

export default function useGetRepeatMeeting({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-repeat-meeting-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getRepeatMeetingList(),
        data: filter,
      });

      return resData;
    },
    enabled: !!filter,
  });
  return query;
}
