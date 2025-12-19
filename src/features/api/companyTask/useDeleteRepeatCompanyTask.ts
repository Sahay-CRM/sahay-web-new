// src/features/hooks/useDeleteRepeatCompanyTask.ts

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { AxiosError } from "axios";

type DatePaging = BaseResponse<CompanyProjectDataProps>;

interface DeleteRepeatTask {
  repetitiveTaskId: string;
  additionalKey?: string;
}

export default function useDeleteRepeatCompanyTask() {
  const deleteRepeatCompanyTaskMutation = useMutation({
    mutationKey: ["delete-company-Repeattask"],
    mutationFn: async (data: DeleteRepeatTask) => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.deleteRepeatCompanyTask(data.repetitiveTaskId),
        data,
      });

      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["get-task-listrepeat"] });
      queryClient.resetQueries({ queryKey: ["get-allRepeatTaskList"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });

  return deleteRepeatCompanyTaskMutation;
}

// import { useMutation } from "@tanstack/react-query";
// import { toast } from "sonner";
// import Api from "@/features/utils/api.utils";
// import Urls from "@/features/utils/urls.utils";
// import { queryClient } from "@/queryClient";
// import { AxiosError } from "axios";

// type DatePaging = BaseResponse<CompanyProjectDataProps>;

// export default function useDeleteRepeatCompanyTask() {
//   const deleteRepeatCompanyTaskMutation = useMutation({
//     mutationKey: ["delete-company-Repeattask"],
//     mutationFn: async (payload: {
//       repetitiveTaskId: string;
//       groupDelete?: boolean;
//     }) => {
//       const { repetitiveTaskId } = payload;
//       const { data: resData } = await Api.delete<DatePaging>({
//         url: Urls.deleteRepeatCompanyTask(repetitiveTaskId),
//         data: payload,
//       });

//       return resData;
//     },
//     onSuccess: (response) => {
//       toast.success(response?.message);
//       queryClient.resetQueries({ queryKey: ["get-task-listrepeat"] });
//     },
//     onError: (error: AxiosError<{ message?: string }>) => {
//       toast.error(error.response?.data?.message || "Delete failed");
//     },
//   });

//   return deleteRepeatCompanyTaskMutation;
// }
