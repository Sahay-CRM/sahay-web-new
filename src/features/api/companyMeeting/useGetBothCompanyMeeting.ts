import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
type DatePaging = BaseResponse<CompanyMeetingDataProps>;

export default function useGetBothCompanyMeeting({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-both-meeting", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getBothMeeting(),
        data: {
          ...filter,
        },
      });

      return resData;
    },
  });
  return query;
}
