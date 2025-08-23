import { AxiosError } from "axios";

import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
// import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface MeetingKpisAdd {
  meetingId: string;
  kpiIds: string[];
}

export default function useAddMeetingKpisData() {
  const addMeetingKpisDataMutation = useMutation({
    mutationKey: ["add-meeting-task-data"],
    mutationFn: async (data: MeetingKpisAdd) => {
      const { data: resData } = await Api.post({
        url: Urls.addMeetingKpisData(),
        data: data,
      });

      return resData;
    },
    onSuccess: () => {
      toast.success("Data Added");
      // queryClient.resetQueries({ queryKey: ["get-meeting-issue"] });
      // queryClient.resetQueries({ queryKey: ["get-meeting-objective"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addMeetingKpisDataMutation;
}
