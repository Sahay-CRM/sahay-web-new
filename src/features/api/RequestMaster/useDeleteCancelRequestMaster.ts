import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function useCancelRequestMasterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: resData } = await Api.delete<{ message: string }>({
        url: Urls.companyRequestCancle(id),
      });

      return resData;
    },
    onSuccess: (data: { message: string }) => {
      queryClient.invalidateQueries({ queryKey: ["getRequestMasterDataList"] });
      toast.success(data?.message || "Request cancelled successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
}

export function useDeleteRequestMasterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: resData } = await Api.delete<{ message: string }>({
        url: Urls.companyRequestDelete(id),
      });

      return resData;
    },
    onSuccess: (data: { message: string }) => {
      queryClient.invalidateQueries({ queryKey: ["getRequestMasterDataList"] });
      toast.success(data?.message || "Request deleted successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
}
