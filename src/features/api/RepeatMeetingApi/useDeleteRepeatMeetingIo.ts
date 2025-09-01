import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";

interface DeleteProps {
  ioType: string;
  issueObjectiveId?: string;
}

export default function useDeleteRepeatMeetingIo() {
  const deleteRepeatMeetingIOMutation = useMutation({
    mutationKey: ["delete-repeatMeetingIO"],
    mutationFn: async (data: DeleteProps) => {
      if (!data.issueObjectiveId) {
        throw new Error("Something Went Wrong");
      }
      const { data: resData } = await Api.post({
        url: Urls.deleteRepeatMeetingAgendaIo(),
        data: data,
      });
      return resData;
    },
    onSuccess: () => {
      toast.success("Meeting Agenda Objective Deleted");
      queryClient.resetQueries({
        queryKey: ["get-repeat-meeting-obj-issue"],
      });
    },
  });

  return deleteRepeatMeetingIOMutation;
}
