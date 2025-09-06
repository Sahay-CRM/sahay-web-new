import { AxiosError } from "axios";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function useDeleteTODONote() {
  return useMutation({
    mutationKey: ["delete-todo-note"],
    mutationFn: async (noteId: string) => {
      const { data } = await Api.delete({
        url: Urls.deleteTODOnote(noteId),
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Note deleted");
      queryClient.invalidateQueries({ queryKey: ["get-todo-notes"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete note");
    },
  });
}
