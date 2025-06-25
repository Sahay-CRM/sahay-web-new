import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useUpdateFireNotification() {
  const notificationMutation = useMutation({
    mutationKey: ["update-notification-asRead"],
    mutationFn: async (notificationIds: string[]) => {
      const { data: resData } = await Api.post({
        url: Urls.updateFireNotificationAsRead(),
        data: { notificationIds: notificationIds },
      });

      return resData;
    },
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["userNotifications"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return notificationMutation;
}
