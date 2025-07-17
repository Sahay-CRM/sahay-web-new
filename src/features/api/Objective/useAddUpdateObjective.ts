import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type EmpRes = CommonResponse<ObjectiveProps>;

export default function useAddUpdateObjective() {
  const addUpdateObjective = useMutation({
    mutationKey: ["add-or-update-employee"],
    mutationFn: async (data: ObjectiveProps) => {
      const isUpdate = Boolean(data.objectiveId);

      const config = {
        url: isUpdate
          ? Urls.updateObjective(data.objectiveId!)
          : Urls.addObjective(),
        data: data,
      };
      const { data: resData } = isUpdate
        ? await Api.put<EmpRes>(config)
        : await Api.post<EmpRes>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-objective-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addUpdateObjective;
}
