import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface StartingMeeting {
  tempMeetingId: string;
  message: string;
}

type DatePaging = CommonResponse<StartingMeeting>;

export default function useCreateDetailMeeting() {
  const createMeetingMutation = useMutation({
    mutationKey: ["create-meeting"],
    mutationFn: async (meetingId: string) => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.detailMeetingCheckStatus(meetingId),
      });

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Meeting Started");
      queryClient.resetQueries({ queryKey: ["get-meeting-details-timing"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return createMeetingMutation;
}
