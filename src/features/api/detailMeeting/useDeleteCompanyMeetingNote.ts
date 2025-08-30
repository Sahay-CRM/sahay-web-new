import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
type DatePaging = BaseResponse<CompanyMeetingDataProps>;

export default function useDeleteCompanyMeetingNote() {
  const deleteCompanyMeetingMutation = useMutation({
    mutationKey: ["delete-note"],
    mutationFn: async (data: string) => {
      if (!data) {
        throw new Error("Something Went Wrong");
      }
      const { data: resData } = await Api.delete<DatePaging>({
        url: Urls.deleteCompanyMeetingNote(data),
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["get-meeting-notes"] });
    },
  });

  return deleteCompanyMeetingMutation;
}
