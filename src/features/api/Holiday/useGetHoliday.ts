import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type HolidayRes = BaseResponse<HolidaysDataProps>;

export default function useGetHoliday({ filter, enable }: FilterDataProps) {
  return useQuery({
    queryKey: ["get-holiday-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<HolidayRes>({
        url: Urls.getHoliday(),
        data: filter,
      });
      return resData.data;
    },
    enabled: !!enable || !!filter,
  });
}
