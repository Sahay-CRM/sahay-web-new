import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { AxiosError } from "axios";
type ImportantDatePaging = BaseResponse<ImportantDatesDataProps>;

export default function useDeleteImportantDates() {
  const deleteImportantDateMutation = useMutation({
    mutationKey: ["delete-important-dates"],
    mutationFn: async (data: ImportantDateData) => {
      if (!data?.importantDateId) {
        throw new Error("Something Went Wrong");
      }
      const { data: resData } = await Api.delete<ImportantDatePaging>({
        url: Urls.deleteImportantDates(data.importantDateId),
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["get-importantdatelist-page"] });
      queryClient.resetQueries({ queryKey: ["get-important-dates-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });

  return deleteImportantDateMutation;
}
