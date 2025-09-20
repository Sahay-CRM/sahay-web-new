import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type GroupRes = CommonResponse<GroupData>;

type RemoveProjectPayload = {
  groupId: string;
  projectIds: string[];
};

export default function useRemoveProjectFromGroup() {
  const removeProjectGroupMutation = useMutation({
    mutationKey: ["remove-project-from-group"],
    mutationFn: async (data: RemoveProjectPayload) => {
      const { data: resData } = await Api.post<GroupRes>({
        url: Urls.removeProjectFromGroup(),
        data,
      });
      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Project removed from group");
      queryClient.resetQueries({ queryKey: ["get-group-list"] });
      queryClient.resetQueries({ queryKey: ["get-group-by-id"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to remove project");
    },
  });

  return removeProjectGroupMutation;
}
