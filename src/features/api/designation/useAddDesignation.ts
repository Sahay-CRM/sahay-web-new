import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useAddOrUpdateDesignation() {
  const addUpdateDesignation = useMutation({
    mutationKey: ["add-or-update-designation"],
    mutationFn: async (data: DesignationData) => {
      const isUpdate = Boolean(data.designationId);
      const payload = {
        designationName: data.designationName,
        departmentId: data.departmentId,
        parentId: data.parentId,
      };
      const config = {
        url: isUpdate
          ? Urls.updateDesignation(data.designationId!)
          : Urls.addDesignation(),
        data: payload,
      };
      const { data: resData } = isUpdate
        ? await Api.put<designationResponse>(config)
        : await Api.post<designationResponse>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-designation-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addUpdateDesignation;
}
