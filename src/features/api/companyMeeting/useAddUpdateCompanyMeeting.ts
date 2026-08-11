import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type DatePaging = CommonResponse<CompanyMeetingDataProps>;

export default function useAddUpdateCompanyMeeting() {
  const addUpdateCompanyMeetingMutation = useMutation({
    mutationKey: ["add-or-update-meeting-list"],
    mutationFn: async (data: CompanyMeetingDataProps) => {
      const { companyMeetingId, ...rest } = data;
      const isUpdate = Boolean(companyMeetingId);

      const config = {
        url: isUpdate
          ? Urls.updateCompanyMeeting(companyMeetingId!)
          : Urls.addCompanyMeeting(),
        data: rest,
      };

      const { data: resData } = isUpdate
        ? await Api.put<DatePaging>(config)
        : await Api.post<DatePaging>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-meeting-list"] });
      queryClient.resetQueries({ queryKey: ["get-meeting-dropdown"] });
    },
    onError: (error: AxiosError<{ message?: string; status?: number }>) => {
      if (error.response?.status !== 417 && error.response?.data?.status !== 417) {
        toast.error(error.response?.data?.message);
      }
    },
  });
  return addUpdateCompanyMeetingMutation;
}
