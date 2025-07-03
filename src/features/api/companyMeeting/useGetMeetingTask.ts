import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
interface MeetingTaskRes {
  detailMeetingTaskId: string;
  detailMeetingId: string;
  taskId: string;
}
type DatePaging = BaseResponse<MeetingTaskRes>;

export default function useGetMeetingTask({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-meeting-tasks-res", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getMeetingTaskData(),
        data: {
          ...filter,
        },
      });

      return resData.data;
    },
  });
  return query;
}
