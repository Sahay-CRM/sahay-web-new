// hooks/useAddOrUpdateDepartment.ts

import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useAddOrUpdateDepartment() {
  return useMutation({
    mutationKey: ["add-or-update-department"],
    mutationFn: async (data: DepartmentData) => {
      const isUpdate = Boolean(data.departmentId);
      const payload = { departmentName: data.departmentName };

      const config = {
        url: isUpdate
          ? Urls.updateDepartment(data.departmentId!)
          : Urls.addDepartment(),
        data: payload,
      };

      const { data: resData } = isUpdate
        ? await Api.put<DepartmentResponse>(config)
        : await Api.post<DepartmentResponse>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-department-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
}
