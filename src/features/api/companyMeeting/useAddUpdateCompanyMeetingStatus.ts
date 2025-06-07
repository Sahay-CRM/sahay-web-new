import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type UpdateMeetingStatusPayload = {
  meetingId: string;
  meetingStatusId: string;
};

type DatePaging = CommonResponse<CompanyMeetingDataProps>;

export function useAddUpdateCompanyMeetingStatus() {
  return useMutation({
    mutationKey: ["update-meeting-status"],
    mutationFn: async (data: UpdateMeetingStatusPayload) => {
      const { meetingId, meetingStatusId } = data;
      const payload = { meetingStatusId };
      const config = {
        url: Urls.updateCompanyMeeting(meetingId),
        data: payload,
      };
      const { data: resData } = await Api.put<DatePaging>(config);
      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Meeting status updated");
      queryClient.resetQueries({ queryKey: ["get-meeting-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
}
