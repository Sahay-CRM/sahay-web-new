import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetTODONotes({ filter, enable }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-todo-notes", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<{
        data: Record<string, TODONotesRes>;
      }>({
        url: Urls.getTODOnotes(filter.toDoId),
        data: filter,
      });

      // object ko array bana do
      return Object.values(resData.data || {});
    },
    enabled: !!enable,
  });
  return query;
}

interface TODONotesRes {
  note: string;
  toDoNoteId: string;
  createdAt: string;
  noteType?: string;
}
