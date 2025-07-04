import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type DatePaging = CommonResponse<SelectedKpisData>;

export default function useGetMeetingSelectedKpis({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-meeting-kpis-res", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getMeetingSelectedKpisData(),
        data: {
          ...filter,
        },
      });

      return resData.data;
    },
  });
  return query;
}
