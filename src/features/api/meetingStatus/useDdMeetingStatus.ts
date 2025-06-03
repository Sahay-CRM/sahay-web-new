import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useDdMeetingStatus() {
  const query = useQuery({
    queryKey: ["get-meeting-status-list"],
    queryFn: async () => {
      const { data: resData } = await Api.post<{
        data: CompanyMeetingStatusDataProps[];
      }>({
        url: Urls.ddMeetingStatus(),
      });

      return resData.data;
    },
  });
  return query;
}
