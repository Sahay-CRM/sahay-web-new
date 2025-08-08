import { AxiosError } from "axios";

import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface MeetingProjectAdd {
  meetingId: string;
  projectIds: string[];
}

export default function useAddMeetingProjectData() {
  const addMeetingProjectDataMutation = useMutation({
    mutationKey: ["add-meeting-project-data"],
    mutationFn: async (data: MeetingProjectAdd) => {
      const { data: resData } = await Api.post({
        url: Urls.addMeetingProjectData(),
        data: data,
      });

      return resData;
    },
    onSuccess: () => {
      toast.success("Data Added");
      queryClient.resetQueries({ queryKey: ["get-project-list-meeting"] });
      queryClient.resetQueries({ queryKey: ["get-project-list"] });
      // queryClient.resetQueries({ queryKey: ["get-meeting-objective"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addMeetingProjectDataMutation;
}
