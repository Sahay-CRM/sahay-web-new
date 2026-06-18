import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";

export function useGetAdminMeetingTemplatesAll(filter?: unknown) {
  return useQuery({
    queryKey: ["get-admin-meeting-templates-all", filter],
    queryFn: async () => {
      const { data } = await Api.post<BaseResponse<AdminMeetingTemplate>>({
        url: Urls.adminMeetingTemplateGetAll(),
        data: filter,
      });
      return data;
    },
  });
}


export function useCloneAdminMeetingTemplateToMeeting() {
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: unknown }) => {
      const { data } = await Api.post<CommonResponse<unknown>>({
        url: Urls.cloneAdminMeetingTemplateToMeeting(id),
        data: payload,
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Meeting Cloned Successfully");
      queryClient.invalidateQueries({ queryKey: ["get-detail-meeting-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to clone meeting");
    },
  });
}
