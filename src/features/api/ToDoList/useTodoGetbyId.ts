import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetTodobyId(id: string) {
  const query = useQuery({
    queryKey: ["get-todo-by-id", id],
    queryFn: async () => {
      const { data: resData } = await Api.post<{
        data: TodoItem;
      }>({
        url: Urls.getByIdTODOList(id),
      });
      return resData.data;
    },
    enabled: !!id,
  });
  return query;
}
