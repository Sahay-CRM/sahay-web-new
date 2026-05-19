import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export interface KpiPermissionItem {
  datapointId: string;
  permissionId: string;
  permissionName?: string;
}

export default function useGetKpiPermission(empId: string) {
  return useQuery({
    queryKey: ["get-kpi-permission-byId", empId],
    queryFn: async () => {
      const { data } = await Api.post<{ data: KpiPermissionItem[] }>({
        url: Urls.getKpiPermission(empId),
      });
      return data;
    },
    staleTime: 0,
    enabled: !!empId,
  });
}
