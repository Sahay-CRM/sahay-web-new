import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type DatePaging = BaseResponse<KpiAllList>;

export default function useDdAllMeetingKpis({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-all-meeting-kpis-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.allKpiList(),
        data: {
          ...filter,
        },
      });
      return resData.data;
    },
  });
  return query;
}
