import { AxiosError } from "axios";

import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface TODONoteAdd {
  note?: string;
  toDoId?: string | null; // अब null भी allow होगा
  noteType?: string | null;
  noteId?: string;
}

type DatePaging = CommonResponse<MeetingNotesRes>;

export default function useTODONotes() {
  const addTODONotesMutation = useMutation({
    mutationKey: ["add-todo-note-data"],
    mutationFn: async (data: TODONoteAdd) => {
      const isUpdate = Boolean(data?.noteId);

      const config = {
        url: isUpdate
          ? Urls.updateTODOnotes(data.noteId!)
          : Urls.addTODOnotes(),
        data: data,
      };

      const { data: resData } = isUpdate
        ? await Api.post<DatePaging>(config)
        : await Api.post<DatePaging>(config);

      return resData;
    },
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["get-todo-notes"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addTODONotesMutation;
}
