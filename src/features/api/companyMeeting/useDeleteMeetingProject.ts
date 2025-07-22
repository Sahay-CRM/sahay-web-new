import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";

interface DeleteMeetingProject {
  projectId: string;
  meetingId: string;
}

export default function useDeleteMeetingProject() {
  const deleteMeetingProjectMutation = useMutation({
    mutationKey: ["delete-meeting-project"],
    mutationFn: async (data: DeleteMeetingProject) => {
      if (!data.projectId) {
        throw new Error("Something Went Wrong");
      }
      const { data: resData } = await Api.delete({
        url: Urls.deleteMeetingProjectData(data.projectId),
        data: {
          meetingId: data.meetingId,
        },
      });
      return resData;
    },
    onSuccess: () => {
      toast.success("Meeting Project Deleted");
    },
  });

  return deleteMeetingProjectMutation;
}
