import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type DatePaging = BaseResponse<CompanyMeetingDataProps>;

export default function useAddUpdateDetailMeeting() {
  const addUpdateDetailMeetingMutation = useMutation({
    mutationKey: ["add-or-update-detailMeeting-list"],
    mutationFn: async (data: CompanyMeetingDataProps) => {
      const isUpdate = Boolean(data?.meetingId);
      const config = {
        url: isUpdate
          ? Urls.updateDetailMeetingById(data.meetingId!)
          : Urls.detailMeetingAdd(),
        data: data,
      };

      const { data: resData } = isUpdate
        ? await Api.post<DatePaging>(config)
        : await Api.post<DatePaging>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-meeting-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addUpdateDetailMeetingMutation;
}
