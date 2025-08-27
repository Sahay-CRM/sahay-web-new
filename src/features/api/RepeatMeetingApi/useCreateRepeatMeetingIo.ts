import { AxiosError } from "axios";
import { toast } from "sonner";

import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/queryClient";

interface CreateAgendaIo {
  repetitiveMeetingId: string;
  id: string;
  ioType: string;
}

export default function useCreateRepeatMeetingIo() {
  const createRepeatIoMutation = useMutation({
    mutationKey: ["add-meeting-project-data"],
    mutationFn: async (data: CreateAgendaIo) => {
      const { data: resData } = await Api.post({
        url: Urls.addRepeatMeetingIo(),
        data: data,
      });

      return resData;
    },
    onSuccess: () => {
      toast.success("Data Added");
      queryClient.resetQueries({
        queryKey: ["get-repeat-meeting-obj-issue"],
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return createRepeatIoMutation;
}
