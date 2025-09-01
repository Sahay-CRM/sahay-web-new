import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useDdNonSelectAllKpiList({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["kpi-nonselect-list-dd-all", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: KpiAllList[] }>({
        url: Urls.ddAllNonSelectDatapointList(),
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
