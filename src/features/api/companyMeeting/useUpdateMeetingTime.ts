import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type DatePaging = CommonResponse<MeetingDetailsTiming>;

export default function useUpdateMeetingTime() {
  const addMeetingTimeMutation = useMutation({
    mutationKey: ["add-meeting-agenda"],
    mutationFn: async (data: MeetingDetailsTiming) => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.timeUpdateByMeeting(data.meetingId),
        data: data,
      });

      return resData;
    },

    onSuccess: (res) => {
      toast.success(res.message || "Data successfully Added");
      queryClient.resetQueries({ queryKey: ["get-meeting-details-timing"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addMeetingTimeMutation;
}
