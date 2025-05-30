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
      const isUpdate = Boolean(data.employeeId);
      const payload = {
        departmentId: data.departmentId,
        designationId: data.designationId,
        employeeEmail: data.employeeEmail,
        employeeMobile: data.employeeMobile,
        employeeName: data.employeeName,
        employeeType: data.employeeType,
        reportingManagerId: data.reportingManagerId,
      };
      const config = {
        url: isUpdate
          ? Urls.updateEmployee(data.employeeId!)
          : Urls.addEmployee(),
        data: payload,
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
