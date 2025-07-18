import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface MeetingAgendaIssue {
  detailMeetingId?: string;
  issueObjectiveId?: string;
  meetingId: string;
  agendaType: string;
}

type DatePaging = CommonResponse<MeetingAgendaIssue>;

export default function useAddMeetingAgenda() {
  const addMeetingAgendaMutation = useMutation({
    mutationKey: ["add-meeting-agenda"],
    mutationFn: async (data: MeetingAgendaIssue) => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.addMeetingAgenda(),
        data: data,
      });

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({
        queryKey: ["get-detail-meeting-agenda-issue-obj"],
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addMeetingAgendaMutation;
}
