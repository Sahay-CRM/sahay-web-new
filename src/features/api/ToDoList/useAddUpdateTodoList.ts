import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type DatePaging = BaseResponse<ToDoList>;

export default function useAddUpdateTodoList() {
  const addUpdateToDoListMutation = useMutation({
    mutationKey: ["add-or-update-todo-list"],
    mutationFn: async (data: ToDoList) => {
      const isUpdate = Boolean(data.toDoId);

      const config = {
        url: isUpdate
          ? Urls.updateTODOList(data.toDoId!)
          : Urls.createTODOList(),
        data: data,
      };

      const { data: resData } = isUpdate
        ? await Api.post<DatePaging>(config)
        : await Api.post<DatePaging>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["getAllTodoList"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addUpdateToDoListMutation;
}
