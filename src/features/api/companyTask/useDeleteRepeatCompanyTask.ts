// src/features/hooks/useDeleteRepeatCompanyTask.ts

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { AxiosError } from "axios";

type DatePaging = BaseResponse<CompanyProjectDataProps>;

export default function useDeleteRepeatCompanyTask() {
  const deleteRepeatCompanyTaskMutation = useMutation({
    mutationKey: ["delete-company-Repeattask"],
    mutationFn: async ({
      repetitiveTaskId,
      groupDelete,
    }: {
      repetitiveTaskId: string;
      groupDelete?: boolean;
    }) => {
      if (!repetitiveTaskId) {
        throw new Error("Something Went Wrong");
      }

      let url = Urls.deleteRepeatCompanyTask(repetitiveTaskId);
      if (groupDelete) {
        url += `?groupDelete=true`;
      }

      const { data: resData } = await Api.delete<DatePaging>({
        url: url,
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
