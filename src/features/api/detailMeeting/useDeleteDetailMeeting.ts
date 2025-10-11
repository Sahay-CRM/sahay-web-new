import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
type DatePaging = BaseResponse<CompanyMeetingDataProps>;

export default function useDeleteDetailMeeting() {
  const deleteDetailMeetingMutation = useMutation({
    mutationKey: ["delete-important-dates"],
    mutationFn: async (data: string) => {
      if (!data) {
        throw new Error("Something Went Wrong");
      }
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.detailMeetingDelete(data),
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.invalidateQueries({ queryKey: ["get-detail-meeting-list"] });
    },
  });

  return deleteDetailMeetingMutation;
}
