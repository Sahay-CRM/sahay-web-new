import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface UpdatedKPISoftDeleteProps {
  dataPointId: string;
  isDeleted: boolean;
}

export default function useUpdateKPISoftDelete() {
  const updateKPISoftDeleteMutation = useMutation({
    mutationKey: ["update-kpi-soft-delete"],
    mutationFn: async (data: UpdatedKPISoftDeleteProps) => {
      const { data: resData } = await Api.post({
        url: Urls.softDeleteRestoreDatapoint(data.dataPointId),
        data: data,
      });

      return resData;
    },
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["get-datapoint-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return updateKPISoftDeleteMutation;
}
