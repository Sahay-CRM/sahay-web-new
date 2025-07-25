import { AxiosError } from "axios";

import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface MeetingNoteAdd {
  meetingId: string;
  employeeId: string;
  note: string;
  detailMeetingNoteId?: string;
}

type DatePaging = CommonResponse<MeetingNotesRes>;

export default function useAddMeetingNotes() {
  const addMeetingNotesMutation = useMutation({
    mutationKey: ["add-meeting-note-data-1"],
    mutationFn: async (data: MeetingNoteAdd) => {
      const isUpdate = Boolean(data?.detailMeetingNoteId);

      const config = {
        url: isUpdate
          ? Urls.updateMeetingNots(data.detailMeetingNoteId!)
          : Urls.addMeetingNots(),
        data: data,
      };

      const { data: resData } = isUpdate
        ? await Api.post<DatePaging>(config)
        : await Api.post<DatePaging>(config);

      return resData;
    },
    onSuccess: () => {
      // toast.success("Data Added");
      queryClient.resetQueries({ queryKey: ["get-meeting-notes"] });
      // queryClient.resetQueries({ queryKey: ["get-meeting-objective"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addMeetingNotesMutation;
}
