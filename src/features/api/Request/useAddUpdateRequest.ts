import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
// import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type DatePaging = CommonResponse<CreateRequest>;

export default function useAddUpdateRequest() {
  const useAddUpdateRequestMutation = useMutation({
    mutationKey: ["add-or-update-request"],
    mutationFn: async (data: CreateRequest) => {
      const isUpdate = Boolean(data.changeRequestId);

      const config = {
        url: isUpdate
          ? Urls.modifyRequest(data.changeRequestId!)
          : Urls.createRequest(),
        data: data,
      };

      const { data: resData } = isUpdate
        ? await Api.post<DatePaging>(config)
        : await Api.post<DatePaging>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["getRequestDataList"] });
      // queryClient.resetQueries({
      //   queryKey: ["get-todo-by-id", res.data.changeRequestId],
      // });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return useAddUpdateRequestMutation;
}
