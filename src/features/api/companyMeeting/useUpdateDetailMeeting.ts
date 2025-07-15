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

interface UpdateDetailMeetingProps {
  meetingId: string;
  status: string;
}

type DatePaging = CommonResponse<StartingMeeting>;

export default function useUpdateDetailMeeting() {
  const updateDetailMeetingMutation = useMutation({
    mutationKey: ["update-meeting"],
    mutationFn: async (data: UpdateDetailMeetingProps) => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.updateDetailMeetingCheckStatus(data.meetingId),
        data: data,
      });

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Meeting Updated");
      queryClient.resetQueries({ queryKey: ["get-meeting-details-timing"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return updateDetailMeetingMutation;
}
