import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type DatePaging = BaseResponse<CompanyMeetingDataProps>;

export default function useAddUpdateCompanyMeeting() {
  const addUpdateCompanyMeetingMutation = useMutation({
    mutationKey: ["add-or-update-meeting-list"],
    mutationFn: async (data: CompanyMeetingDataProps) => {
      const isUpdate = Boolean(data.meetingId);
      const payload = {
        meetingName: data?.meetingName,
        meetingDescription: data?.meetingDescription,
        meetingDateTime: data?.meetingDateTime,
        meetingStatusId: data?.meetingStatusId,
        meetingTypeId: data?.meetingTypeId,
        joiners: data?.joiners,
      };

      const config = {
        url: isUpdate
          ? Urls.updateCompanyMeeting(data.meetingId!)
          : Urls.addCompanyMeeting(),
        data: payload,
      };

      const { data: resData } = isUpdate
        ? await Api.put<DatePaging>(config)
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
  return addUpdateCompanyMeetingMutation;
}
