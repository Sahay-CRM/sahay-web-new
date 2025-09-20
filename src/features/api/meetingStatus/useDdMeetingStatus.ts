import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useDdMeetingStatus({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-meeting-status-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<{
        data: CompanyMeetingStatusDataProps[];
      }>({
        url: Urls.ddMeetingStatus(),
        data: filter,
      });

      return resData.data;
    },
    enabled: !!enable || !!filter,
  });
  return query;
}
