import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type ImportantDatePaging = BaseResponse<ImportantDatesDataProps>;

export default function useAddUpdateImportantDates() {
  const addUpdateImportantDateMutation = useMutation({
    mutationKey: ["add-or-update-important-dates"],
    mutationFn: async (data: ImportantDateData) => {
      const isUpdate = Boolean(data.importantDateId);
      const config = {
        url: isUpdate
          ? Urls.updateImportantDates(data.importantDateId!)
          : Urls.addImportantDates(),
        data: data,
      };

      const { data: resData } = isUpdate
        ? await Api.put<ImportantDatePaging>(config)
        : await Api.post<ImportantDatePaging>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-important-dates-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addUpdateImportantDateMutation;
}
