import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
type ImportantDatePaging = BaseResponse<ImportantDatesDataProps>;

export default function useGetImportantDates() {
  const query = useQuery({
    queryKey: ["get-important-dates-list"],
    queryFn: async () => {
      const { data: resData } = await Api.post<ImportantDatePaging>({
        url: Urls.getAllImportantDates(),
      });

      return resData;
    },
  });
  return query;
}
