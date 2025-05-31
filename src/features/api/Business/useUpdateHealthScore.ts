import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type HealthScoreRes = BaseResponse<HealthScore>;

export default function useUpdateHealthScore() {
  const updateHealthScoreMutation = useMutation({
    mutationKey: ["add-or-update-health-score-by-core-param"],
    mutationFn: async (data: HealthScore) => {
      const config = {
        url: Urls.updateHealthScore(),
        data: data,
      };

      const { data: resData } = await Api.post<HealthScoreRes>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({
        queryKey: ["get-health-score-by-core-param-id"],
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });

  return updateHealthScoreMutation;
}
