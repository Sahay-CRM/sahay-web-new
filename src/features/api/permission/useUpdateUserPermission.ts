import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface PermissionResponse {
  message: string;
  success?: boolean;
}

interface Permission {
  moduleId: string;
  permissionId: string;
}

interface PermissionPayload {
  employeeId: string;
  permissions: Permission[];
}

export default function useUpdateUserPermission() {
  return useMutation({
    mutationKey: ["update-admin-user-permission"],
    mutationFn: async (data: PermissionPayload) => {
      const { data: resData } = await Api.put<PermissionResponse>({
        url: Urls.updateUserPermission(data.employeeId),
        data: {
          permissions: data.permissions,
        },
      });

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Permissions updated successfully");
      queryClient.resetQueries({ queryKey: ["get-adminUserPer-byId"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        error.response?.data?.message || "Failed to update permissions",
      );
    },
  });
}
