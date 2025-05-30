import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
type DatePaging = BaseResponse<CompanyMeetingDataProps>;

export default function useGetCompanyMeetingById(id: string) {
  const query = useQuery({
    queryKey: ["get-meeting-list-by-id", id],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getCompanyMeetingById(id),
      });

      return resData;
    },
  });
  return query;
}
