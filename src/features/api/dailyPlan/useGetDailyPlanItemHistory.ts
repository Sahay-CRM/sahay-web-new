import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

interface HistoryParams {
  taskId?: string;
  meetingId?: string;
  ganttItemId?: string;
}

export default function useGetDailyPlanItemHistory({
  taskId,
  meetingId,
  ganttItemId,
}: HistoryParams) {
  return useQuery({
    queryKey: ["daily-plan-item-history", taskId, meetingId, ganttItemId],
    queryFn: async () => {
      const { data } = await Api.post<{ data: DailyPlanItemHistoryEntry[] }>({
        url: Urls.getDailyPlanItemHistory(),
        data: { taskId, meetingId, ganttItemId },
      });
      return data;
    },
    enabled: Boolean(taskId || meetingId || ganttItemId),
  });
}
