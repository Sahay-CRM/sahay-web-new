import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetAllTodoList() {
  const query = useQuery({
    queryKey: ["getAllTodoList"],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: ToDoList[] }>({
        url: Urls.getAllTODOList(),
      });

      return resData.data;
    },
  });

  return query;
}
