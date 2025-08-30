import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";

interface DeleteProps {
  ioType: string;
  issueObjectiveId?: string;
}

export default function useDeleteMeetingObjective() {
  const deleteMeetingObjectiveMutation = useMutation({
    mutationKey: ["delete-meeting-objective"],
    mutationFn: async (data: DeleteProps) => {
      if (!data.issueObjectiveId) {
        throw new Error("Something Went Wrong");
      }
      const { data: resData } = await Api.post({
        url: Urls.deleteMeetingAgendaObjective(data.issueObjectiveId),
        data: {
          ioType: data.ioType,
        },
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
