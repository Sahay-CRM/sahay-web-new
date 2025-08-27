import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type DatePaging = BaseResponse<DetailMeetingObjectives>;

export default function useDdRepeatMeetingIo({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["dd-repeatMeeting-obj-issue", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.ddRepeatMeetingIo(),
        data: filter,
      });

      return resData;
    },
    enabled: !!enable,
  });
  return query;
}
