import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetAllTodoList(selectDate?: string) {
  const query = useQuery({
    queryKey: ["getAllTodoList", selectDate],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: ToDoList[] }>({
        url: Urls.getAllTODOList(),
        data: {
          selectDate: selectDate || new Date().toISOString().split("T")[0],
        },
      });

      return resData.data;
    },
  });

  return query;
}
