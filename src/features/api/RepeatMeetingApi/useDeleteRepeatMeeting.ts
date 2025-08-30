import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { AxiosError } from "axios";

type DatePaging = BaseResponse<RepeatMeeting>;

interface DeleteRepeatMeeting {
  repetitiveMeetingId: string;
  groupDelete: boolean;
}

export default function useDeleteRepeatMeeting() {
  const deleteRepeatMeetingMutation = useMutation({
    mutationKey: ["delete-repeatMeeting"],
    mutationFn: async (data: DeleteRepeatMeeting) => {
      if (!data.repetitiveMeetingId) {
        throw new Error("Something Went Wrong");
      }
      const { data: resData } = await Api.delete<DatePaging>({
        url: Urls.deleteRepeatMeetingList(data.repetitiveMeetingId),
        data: data,
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["get-repeat-meeting-list"] });
      queryClient.resetQueries({ queryKey: ["repeatMeeting-by-id"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });

  return deleteRepeatMeetingMutation;
}
