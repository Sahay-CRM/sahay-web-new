import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface UpdateNotificationData {
  notificationId?: string;
  title: string;
  notifiedTime: string;
  employeeId: string;
}

export default function useUpdateNotification() {
  const updateNotiMutation = useMutation({
    mutationKey: ["update-notification-asRead"],
    mutationFn: async (data: UpdateNotificationData) => {
      const { data: resData } = await Api.post({
        url: Urls.updateFireNotificationAsRead(),
        data: data,
      });

      return resData;
    },
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["userNotifications"] });
      queryClient.resetQueries({ queryKey: ["userNotifications"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return updateNotiMutation;
}
