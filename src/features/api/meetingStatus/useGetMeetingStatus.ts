import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
type DatePaging = BaseResponse<CompanyMeetingStatusDataProps>;

export default function useGetCompanyMeetingStatus({
  filter,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-meeting-status-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getAllMeetingStatus(),
        data: {
          ...filter,
        },
      });

      return resData;
    },
  });
  return query;
}
