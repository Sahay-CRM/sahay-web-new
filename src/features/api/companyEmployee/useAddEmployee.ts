import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useAddOrUpdateEmployee() {
  const addUpdateEmployee = useMutation({
    mutationKey: ["add-or-update-employee"],
    mutationFn: async (data: EmployeeData) => {
      const isUpdate = Boolean(data.companyEmployeeId);

      const config = {
        url: isUpdate
          ? Urls.updateEmployee(data.companyEmployeeId!)
          : Urls.addEmployee(),
        data: data,
      };
      const { data: resData } = isUpdate
        ? await Api.put<EmployeeResponse>(config)
        : await Api.post<EmployeeResponse>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-employee-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addUpdateEmployee;
}
