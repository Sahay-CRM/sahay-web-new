import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type EmpRes = CommonResponse<RepeatMeeting>;

export default function useAddUpdateRepeatMeetingStatus() {
  const addUpdateRepeatMeetingStatusMutation = useMutation({
    mutationKey: ["add-or-update-repeatMeeting-status"],
    mutationFn: async (data: RepeatMeeting) => {
      const { data: resData } = await Api.post<EmpRes>({
        url: Urls.updateRepeatMeetingStatusChange(data.repetitiveMeetingId!),
        data: data,
      });

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "successful");
      queryClient.resetQueries({ queryKey: ["get-repeat-meeting-list"] });
      // queryClient.resetQueries({ queryKey: ["repeatMeeting-by-id"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addUpdateRepeatMeetingStatusMutation;
}
