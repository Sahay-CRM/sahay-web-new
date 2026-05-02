import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useUpdateRequestMasterMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateRequestMaster>;
    }) => {
      const { data: resData } = await Api.post<{ message: string }>({
        url: Urls.updateRequestCompany(id),
        data: data,
      });

      return resData;
    },
    onSuccess: (data: { message: string }) => {
      queryClient.invalidateQueries({ queryKey: ["getRequestMasterDataList"] });
      toast.success(data?.message || "Request updated successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });

  return mutation;
}
