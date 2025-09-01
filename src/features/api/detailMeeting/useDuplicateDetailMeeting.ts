import { AxiosError } from "axios";

import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
// import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/queryClient";

interface DuplicateDetailMeetingProps {
  meetingId: string;
  meetingName: string;
  selectDate: Date | string;
}

export default function useDuplicateDetailMeeting() {
  const duplicateDetailMeetingMutation = useMutation({
    mutationKey: ["add-meeting-task-data"],
    mutationFn: async (data: DuplicateDetailMeetingProps) => {
      const { data: resData } = await Api.post({
        url: Urls.duplicateDetailMeeting(),
        data: data,
      });

      return resData;
    },
    onSuccess: () => {
      toast.success("Data Added");
      queryClient.resetQueries({ queryKey: ["get-detail-meeting-list"] });
      queryClient.resetQueries({ queryKey: ["get-meeting-details-timing"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return duplicateDetailMeetingMutation;
}
