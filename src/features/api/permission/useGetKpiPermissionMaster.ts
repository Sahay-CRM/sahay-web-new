import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export interface KpiPermissionMasterItem {
  id: string;
  title: string;
}

export default function useGetKpiPermissionMaster() {
  return useQuery({
    queryKey: ["get-kpi-permission-master"],
    queryFn: async () => {
      const { data } = await Api.post<{ data: KpiPermissionMasterItem[] }>({
        url: Urls.getKpiPermissionMaster(),
      });
      return data;
    },
  });
}
