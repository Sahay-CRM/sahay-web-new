import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";

type DesignationRes = BaseResponse<DesignationDetails>;

export default function useDeleteDesignation() {
  const deleteDesignationMutation = useMutation({
    mutationKey: ["delete-designation"],
    mutationFn: async (designationId: string) => {
      const { data: resData } = await Api.delete<DesignationRes>({
        url: Urls.deletedesignation(designationId),
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["get-designation-list"] });
    },
  });

  return deleteDesignationMutation;
}
