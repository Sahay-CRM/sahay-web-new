import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";

export default function useDeleteMeetingObjective() {
  const deleteMeetingObjectiveMutation = useMutation({
    mutationKey: ["delete-meeting-objective"],
    mutationFn: async (detailMeetingAgendaIssueId: string) => {
      if (!detailMeetingAgendaIssueId) {
        throw new Error("Something Went Wrong");
      }
      const { data: resData } = await Api.delete({
        url: Urls.deleteMeetingAgendaObjective(detailMeetingAgendaIssueId),
      });
      return resData;
    },
    onSuccess: () => {
      toast.success("Meeting Agenda Objective Deleted");
      queryClient.resetQueries({
        queryKey: ["get-detail-meeting-agenda-issue-obj"],
      });
    },
  });

  return deleteMeetingObjectiveMutation;
}
