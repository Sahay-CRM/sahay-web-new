import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";

interface DeleteMeetingTask {
  taskId: string;
  meetingId: string;
}

export default function useDeleteMeetingTask() {
  const deleteMeetingTaskMutation = useMutation({
    mutationKey: ["delete-meeting-task"],
    mutationFn: async (data: DeleteMeetingTask) => {
      if (!data.taskId) {
        throw new Error("Something Went Wrong");
      }
      const { data: resData } = await Api.delete({
        url: Urls.deleteMeetingTaskData(data.taskId),
        data: {
          meetingId: data.meetingId,
        },
      });
      return resData;
    },
    onSuccess: () => {
      toast.success("Meeting Task Deleted");
    },
  });

  return deleteMeetingTaskMutation;
}
