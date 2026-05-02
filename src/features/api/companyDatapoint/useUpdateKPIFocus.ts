import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface UpdateKPIFocusVariables {
  kpiId: string;
  isFocus: boolean;
}

export default function useUpdateKPIFocus() {
  const updateKPIFocusMutation = useMutation({
    mutationKey: ["update-kpi-focus"],
    mutationFn: async ({ kpiId, isFocus }: UpdateKPIFocusVariables) => {
      const config = {
        url: Urls.updateKPIFocus(kpiId),
        data: { isFocus },
      };

      const { data: resData } = await Api.post<BaseResponse<unknown>>(config);
      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Focus updated successfully");
      queryClient.resetQueries({ queryKey: ["get-datapoint-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update focus");
    },
  });
  return updateKPIFocusMutation;
}
