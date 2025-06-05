import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useDdCompanyMeeting() {
  const query = useQuery({
    queryKey: ["get-meeting-dropdown"],
    queryFn: async () => {
      const { data: resData } = await Api.post<{
        data: CompanyMeetingDataProps;
      }>({
        url: Urls.getAllCompanyMeetingByPage(),
      });

      return resData.data;
    },
  });
  return query;
}
