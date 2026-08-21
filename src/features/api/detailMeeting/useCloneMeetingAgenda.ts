import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface CloneMeetingAgendaPayload {
  sourceMeetingId: string;
  issueIds: string[];
  objectiveIds: string[];
}

export default function useCloneMeetingAgenda() {
  const mutation = useMutation({
    mutationKey: ["clone-meeting-agenda"],
    mutationFn: async ({
      targetMeetingId,
      payload,
    }: {
      targetMeetingId: string;
      payload: CloneMeetingAgendaPayload;
    }) => {
      const { data: resData } = await Api.post<BaseResponse<unknown>>({
        url: Urls.cloneMeetingAgenda(targetMeetingId),
        data: payload,
      });
      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Agenda cloned successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to clone agenda");
    },
  });

  return mutation;
}
