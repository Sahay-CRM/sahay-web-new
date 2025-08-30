import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
interface MeetingKpisRes {
  detailMeetingKpiId: string;
  detailMeetingId: string;
  kpiId: string;
}
type DatePaging = BaseResponse<MeetingKpisRes>;

export default function useGetMeetingKpis({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-meeting-kpis-res", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getMeetingKpisData(),
        data: {
          ...filter,
        },
      });

      return resData.data;
    },
  });
  return query;
}
