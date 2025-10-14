import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";

interface DeleteGroupProps {
  groupId: string;
  isForce?: boolean;
}

type GroupRes = BaseResponse<GroupData>;

export default function useDeleteGroup() {
  const deleteGroupMutation = useMutation({
    mutationKey: ["delete-group"],
    mutationFn: async (data: DeleteGroupProps) => {
      if (!data.groupId) {
        throw new Error("Something Went Wrong");
      }

      const { data: resData } = await Api.post<GroupRes>({
        url: Urls.deleteGroup(data.groupId),
        data,
      });

      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message || "Group deleted successfully");
      queryClient.resetQueries({ queryKey: ["get-group-by-id"] });
      queryClient.resetQueries({ queryKey: ["get-group-list"] });
      queryClient.resetQueries({ queryKey: ["get-meeting-notes"] });
    },
  });

  return deleteGroupMutation;
}
