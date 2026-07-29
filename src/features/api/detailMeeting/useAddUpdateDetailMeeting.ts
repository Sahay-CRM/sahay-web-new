import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type DatePaging = CommonResponse<CompanyMeetingDataProps>;

export default function useAddUpdateDetailMeeting() {
  const addUpdateDetailMeetingMutation = useMutation({
    mutationKey: ["add-or-update-detailMeeting-list"],
    mutationFn: async (data: CompanyMeetingDataProps) => {
      const { meetingId, ...rest } = data;
      const isUpdate = Boolean(meetingId);
      const config = {
        url: isUpdate
          ? Urls.updateDetailMeetingById(meetingId!)
          : Urls.detailMeetingAdd(),
        data: isUpdate ? rest : data,
      };

      const { data: resData } = await Api.post<DatePaging>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-detail-meeting-list"] });
      queryClient.resetQueries({
        queryKey: ["get-meeting-details-timing", res.data.meetingId],
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addUpdateDetailMeetingMutation;
}
