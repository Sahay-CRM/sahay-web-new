import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type EmpRes = CommonResponse<RepeatMeeting>;

export default function useAddUpdateRepeatMeeting() {
  const addUpdateRepeatMeetingMutation = useMutation({
    mutationKey: ["add-or-update-repeatMeeting"],
    mutationFn: async (data: RepeatMeeting) => {
      const isUpdate = Boolean(data.repetitiveMeetingId);

      const config = {
        url: isUpdate
          ? Urls.updateRepeatMeetingList(data.repetitiveMeetingId!)
          : Urls.addRepeatMeetingList(),
        data: data,
      };
      const { data: resData } = isUpdate
        ? await Api.post<EmpRes>(config)
        : await Api.post<EmpRes>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "successful");
      queryClient.resetQueries({ queryKey: ["get-repeat-meeting-list"] });
      queryClient.resetQueries({ queryKey: ["repeatMeeting-by-id"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addUpdateRepeatMeetingMutation;
}
