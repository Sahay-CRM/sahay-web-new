import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
// import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface AgendaMeetingTiming {
  success: boolean;
  status: number;
  message: string;
}

export default function useUpdateAgendaMeeting() {
  const editAgendaTimingMeetingMutation = useMutation({
    mutationKey: ["update-meeting"],
    mutationFn: async (data: MeetingDetailsTiming) => {
      const { data: resData } = await Api.post<AgendaMeetingTiming>({
        url: Urls.updateDetailObjectivesIssue(),
        data: data,
      });

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Meeting Updated");
      // queryClient.resetQueries({ queryKey: ["get-meeting-details-timing"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return editAgendaTimingMeetingMutation;
}
