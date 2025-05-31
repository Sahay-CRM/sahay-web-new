import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
type DatePaging = BaseResponse<CompanyDatapointDataProps>;

export default function useGetKpiNonSel({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-datapoint-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getKpinonselectList(),
        data: {
          ...filter,
        },
      });

      return resData;
    },
  });
  return query;
}
