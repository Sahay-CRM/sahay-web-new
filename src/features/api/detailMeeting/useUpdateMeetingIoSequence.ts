import { AxiosError } from "axios";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";

type DatePaging = CommonResponse<MeetingAgenda>;

export default function useUpdateMeetingIoSequence() {
  const updateIoSequenceMutation = useMutation({
    mutationKey: ["updateMeeting-ioSequence"],
    mutationFn: async (data: IOUpdateSequence) => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.updateIoSequence(),
        data: data,
      });

      return resData;
    },

    onSuccess: (res) => {
      toast.success(res.message || "Data successfully Updated");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return updateIoSequenceMutation;
}
