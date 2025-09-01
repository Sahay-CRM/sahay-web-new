import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";

interface DeleteMeetingProject {
  projectId: string;
  meetingId: string;
  issueTaskId?: string;
  objectiveTaskId?: string;
}

export default function useDeleteMeetingProject() {
  const deleteMeetingProjectMutation = useMutation({
    mutationKey: ["delete-meeting-project"],
    mutationFn: async (data: DeleteMeetingProject) => {
      const { data: resData } = await Api.post({
        url: Urls.deleteMeetingProjectData(),
        data: data,
      });
      return resData;
    },
    onSuccess: () => {
      toast.success("Meeting Project Deleted");
    },
  });

  return deleteMeetingProjectMutation;
}
