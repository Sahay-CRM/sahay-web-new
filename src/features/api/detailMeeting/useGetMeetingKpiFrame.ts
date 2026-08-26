import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type FrameResponse = CommonResponse<SelectedKpisData>;

export default function useGetMeetingKpiFrame({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-detailMeeting-kpis-frame", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<FrameResponse>({
        url: Urls.getMeetingKpiFrame(),
        data: {
          ...filter,
        },
      });

      return resData.data;
    },
    enabled: !!enable,
  });
  return query;
}
