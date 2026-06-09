import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
import type { GanttWorkspaceDetailResponse } from "@/types/gantt";

export function useGanttWorkspaceDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["gantt-workspace-detail", id],
    queryFn: async () => {
      const { data } = await Api.post<{ data: GanttWorkspaceDetailResponse }>({
        url: Urls.ganttWorkspaceDetail(id!),
        data: {},
      });
      return data.data;
    },
    enabled: !!id,
  });
}
