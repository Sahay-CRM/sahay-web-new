import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface MeetingAgendaIssue {
  detailMeetingAgendaIssueId?: string;
  detailMeetingId?: string;
  meetingId: string;
  agendaIssue: string;
}

type DatePaging = CommonResponse<MeetingAgendaIssue>;

export default function useAddMeetingAgenda() {
  const addMeetingAgendaMutation = useMutation({
    mutationKey: ["add-meeting-agenda"],
    mutationFn: async (data: MeetingAgendaIssue) => {
      const isUpdate = Boolean(data.detailMeetingAgendaIssueId);

      const config = {
        url: isUpdate
          ? Urls.updateMeetingAgendaIssue(data.detailMeetingAgendaIssueId!)
          : Urls.addMeetingAgendaIssue(),
        data: data,
      };

      const { data: resData } = isUpdate
        ? await Api.post<DatePaging>(config)
        : await Api.post<DatePaging>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-meeting-issue"] });
      queryClient.resetQueries({ queryKey: ["get-meeting-objective"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addMeetingAgendaMutation;
}
