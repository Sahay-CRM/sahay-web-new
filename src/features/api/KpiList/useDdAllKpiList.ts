import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useDdAllKpiList({ filter, enable }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["kpi-list-dd-all", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: KpiAllList[] }>({
        url: Urls.ddAllDatapointList(),
        data: {
          ...filter,
        },
      });

      return resData;
    },
    enabled: !!enable,
  });
  return query;
}
