import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
type DatePaging = BaseResponse<CompanyMeetingDataProps>;

export default function useDeleteCompanyMeeting() {
  const deleteCompanyMeetingMutation = useMutation({
    mutationKey: ["delete-important-dates"],
    mutationFn: async (data: string) => {
      if (!data) {
        throw new Error("Something Went Wrong");
      }
      const { data: resData } = await Api.delete<DatePaging>({
        url: Urls.deleteCompanyMeeting(data),
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.invalidateQueries({ queryKey: ["get-meeting-list"] });
      queryClient.invalidateQueries({ queryKey: ["get-meeting-dropdown"] });
      queryClient.invalidateQueries({ queryKey: ["get-meeting-list-by-id"] });
    },
  });

  return deleteCompanyMeetingMutation;
}
