import { AxiosError } from "axios";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";

type GroupRes = CommonResponse<NotesGroupProps>;

export default function useAddNoteGroup() {
  const noteGroupMutation = useMutation({
    mutationKey: ["add-update-group"],
    mutationFn: async (data: NotesGroupProps) => {
      const { data: resData } = await Api.post<GroupRes>({
        url: Urls.addNotesGroup(),
        data: data,
      });

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-meeting-notes"] });
      // queryClient.resetQueries({ queryKey: ["get-group-dropdown"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return noteGroupMutation;
}
