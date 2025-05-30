import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { AxiosError } from "axios";
type DatePaging = BaseResponse<CompanyMeetingDataProps>;

export default function useDeleteCompanyMeeting() {
  const deleteCompanyMeetingMutation = useMutation({
    mutationKey: ["delete-important-dates"],
    mutationFn: async (data: CompanyMeetingDataProps) => {
      if (!data?.meetingId) {
        throw new Error("Something Went Wrong");
      }
      const { data: resData } = await Api.delete<DatePaging>({
        url: Urls.deleteCompanyMeeting(data.meetingId),
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["get-meeting-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });

  return deleteCompanyMeetingMutation;
}
