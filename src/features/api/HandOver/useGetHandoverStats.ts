import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export interface HandoverStats {
  tasks: number;
  assignedTasks: number;
  projects: number;
  assignedProjects: number;
  meetings: number;
  assignedMeetings: number;
  todos: number;
  requests: number;
  subordinates: number;
  total: number;
}

type HandoverStatsRes = CommonResponse<HandoverStats>;

export default function useGetHandoverStats({
  userId,
  enabled,
}: {
  userId: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["get-handover-stats", userId],
    queryFn: async () => {
      const { data } = await Api.post<HandoverStatsRes>({
        url: Urls.getUserHandoverDataById(userId),
      });
      return data;
    },
    enabled: !!enabled && !!userId,
  });
}
