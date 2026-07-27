import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type DatePaging = BaseResponse<CompanyMeetingDataProps>;

export default function useGetAllBothCompanyMeeting() {
  const query = useQuery({
    queryKey: ["get-all-both-meeting"],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getAllBothMeeting(),
      });

      return resData;
    },
  });
  return query;
}
