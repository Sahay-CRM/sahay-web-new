import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";

type DeleteMeetingTask =
  | {
      taskId: string;
      ioType: string;
      issueTaskId?: string;
    }
  | {
      taskId: string;
      ioType: string;
      objectiveTaskId?: string;
    };

export default function useDeleteMeetingTask() {
  const deleteMeetingTaskMutation = useMutation({
    mutationKey: ["delete-meeting-task"],
    mutationFn: async (data: DeleteMeetingTask) => {
      const { data: resData } = await Api.post({
        url: Urls.deleteMeetingTaskData(),
        data: data,
      });
      return resData;
    },
    onSuccess: () => {
      toast.success("Meeting Task Deleted");
    },
  });

  return deleteMeetingTaskMutation;
}
