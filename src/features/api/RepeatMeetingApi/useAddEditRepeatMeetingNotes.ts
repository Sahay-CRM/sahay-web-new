import { AxiosError } from "axios";

import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type DatePaging = CommonResponse<RepeatMeetingNotesRes>;

export default function useAddEditRepeatMeetingNotes() {
  const addRepeatMeetingNotesMutation = useMutation({
    mutationKey: ["add-meeting-note-data-1"],
    mutationFn: async (data: RepeatMeetingNotesRes) => {
      const isUpdate = Boolean(data?.noteId);

      const config = {
        url: isUpdate
          ? Urls.updateRepeatMeetingNotes(data.noteId!)
          : Urls.addRepeatMeetingNotes(),
        data: data,
      };

      const { data: resData } = isUpdate
        ? await Api.post<DatePaging>(config)
        : await Api.post<DatePaging>(config);

      return resData;
    },
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["get-repeatMeeting-notes"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addRepeatMeetingNotesMutation;
}
