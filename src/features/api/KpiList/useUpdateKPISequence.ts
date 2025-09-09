import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface UpdatedKPISequenceProps {
  frequencyType: string;
  kpiSequenceArray: string[];
}

export default function useUpdateKPISequence() {
  const updateKPISequenceMutation = useMutation({
    mutationKey: ["add-or-update-employee"],
    mutationFn: async (data: UpdatedKPISequenceProps) => {
      const { data: resData } = await Api.post({
        url: Urls.updateKPISequence(),
        data: data,
      });

      return resData;
    },
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["get-kpi-dashboard-structure"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return updateKPISequenceMutation;
}
