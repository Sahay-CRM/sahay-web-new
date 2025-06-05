import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type HealthWeightageRes = BaseResponse<SubParaByCorePara>;

export default function useUpdateHealthWeightage() {
  const navigate = useNavigate();

  const updateHealthWeightageMutation = useMutation({
    mutationKey: ["update-health-Weightage-by-core-param"],
    mutationFn: async (data: CoreParameterData) => {
      const config = {
        url: Urls.updateHealthWeightage(),
        data: data,
      };

      const { data: resData } = await Api.post<HealthWeightageRes>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({
        queryKey: ["get-core-parameter-dropdown"],
      });
      queryClient.resetQueries({
        queryKey: ["get-Sub-ParaByCore"],
      });
      navigate("/dashboard/business/health-weightage");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });

  return updateHealthWeightageMutation;
}
