import { AxiosError } from "axios";
import { toast } from "sonner";

import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";

interface CreateAgendaIo {
  meetingId: string;
  name: string;
  ioType: string;
}

export default function useCreateIo() {
  const createIoMutation = useMutation({
    mutationKey: ["add-meeting-project-data"],
    mutationFn: async (data: CreateAgendaIo) => {
      const { data: resData } = await Api.post({
        url: Urls.createIo(),
        data: data,
      });

      return resData;
    },
    onSuccess: () => {
      toast.success("Data Added");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return createIoMutation;
}
