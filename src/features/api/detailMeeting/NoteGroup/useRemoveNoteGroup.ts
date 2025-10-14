import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type GroupRes = CommonResponse<GroupData>;
type RemoveNoteFromGroupPayload = {
  groupId: string;
  meetingNoteId: string;
};

export default function useRemoveGroupFromNote() {
  const removeGroupMutation = useMutation({
    mutationKey: ["remove-group-from-Note"],
    mutationFn: async (data: RemoveNoteFromGroupPayload) => {
      const { data: resData } = await Api.post<GroupRes>({
        url: Urls.removeNotesGroup(),
        data,
      });
      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "removed from group");
      queryClient.resetQueries({ queryKey: ["get-meeting-notes"] });
      //   queryClient.resetQueries({ queryKey: ["get-group-by-id"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to remove");
    },
  });

  return removeGroupMutation;
}
