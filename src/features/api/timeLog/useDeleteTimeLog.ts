import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useDeleteTimeLog() {
  return useMutation({
    mutationKey: ["delete-time-log"],
    mutationFn: async (timeLogId: string) => {
      const { data: resData } = await Api.post<CommonResponse<unknown>>({
        url: Urls.deleteTimeLog(timeLogId),
      });
      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Time log deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["get-all-time-logs"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete time log");
    },
  });
}
