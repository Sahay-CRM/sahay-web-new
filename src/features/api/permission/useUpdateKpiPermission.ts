import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface KpiPermissionResponse {
  message: string;
  success?: boolean;
}

interface KpiPermission {
  datapointId: string;
  permissionId: string;
}

interface KpiPermissionPayload {
  employeeId: string;
  permissions: KpiPermission[];
}

export default function useUpdateKpiPermission() {
  return useMutation({
    mutationKey: ["update-kpi-permission"],
    mutationFn: async (data: KpiPermissionPayload) => {
      const { data: resData } = await Api.post<KpiPermissionResponse>({
        url: Urls.updateKpiPermission(data.employeeId),
        data: {
          permissions: data.permissions,
        },
      });

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "KPI Permissions updated successfully");
      queryClient.invalidateQueries({ queryKey: ["get-kpi-permission-byId"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to update KPI permissions. (Endpoint might not exist yet)",
      );
    },
  });
}
