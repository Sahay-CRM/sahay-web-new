import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";

type DeleteRes = CommonResponse<CreateRequest>;

export default function useDeleteRequest() {
  const deleteRequestMutation = useMutation({
    mutationKey: ["delete-request"],
    mutationFn: async (changeRequestId: string) => {
      const { data: resData } = await Api.delete<DeleteRes>({
        url: Urls.deleteRequest(changeRequestId),
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["getRequestDataList"] });
    },
  });

  return deleteRequestMutation;
}
