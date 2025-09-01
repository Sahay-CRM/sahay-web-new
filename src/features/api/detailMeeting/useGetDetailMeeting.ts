import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type DatePaging = BaseResponse<CompanyMeetingDataProps>;

export default function useGetDetailMeeting({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-detail-meeting-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.detailMeetingGet(),
        data: filter,
      });

      return resData;
    },
    enabled: !!filter,
  });
  return query;
}
