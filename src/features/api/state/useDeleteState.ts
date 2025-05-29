import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
// import { AxiosError } from "axios";

export default function useDeleteState() {
  const deleteStateMutation = useMutation({
    mutationKey: ["delete-state"],
    mutationFn: async (data: StateData) => {
      const { data: resData } = await Api.delete<CreateStateResponse>({
        url: Urls.deleteState(data?.stateId),
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["get-state-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return deleteStateMutation;
}
