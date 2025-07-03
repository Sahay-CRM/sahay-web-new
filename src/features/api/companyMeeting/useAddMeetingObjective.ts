import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface MeetingAgendaObjective {
  detailMeetingAgendaObjectiveId?: string;
  meetingId: string;
  detailMeetingId?: string;
  agendaObjective: string;
}

type DatePaging = CommonResponse<MeetingAgendaObjective>;

export default function useAddMeetingObjective() {
  const addAgendaObjectiveMutation = useMutation({
    mutationKey: ["add-meeting-agenda-objective"],
    mutationFn: async (data: MeetingAgendaObjective) => {
      const isUpdate = Boolean(data.detailMeetingAgendaObjectiveId);

      const config = {
        url: isUpdate
          ? Urls.updateMeetingAgendaObjective(
              data.detailMeetingAgendaObjectiveId!,
            )
          : Urls.addMeetingAgendaObjective(),
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
  return addAgendaObjectiveMutation;
}
