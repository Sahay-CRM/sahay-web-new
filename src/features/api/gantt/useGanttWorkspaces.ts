import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
import type {
  GanttWorkspaceListRequest,
  GanttWorkspaceListResponse,
} from "@/types/gantt";

export function useGanttWorkspaces(filter: GanttWorkspaceListRequest) {
  return useQuery({
    queryKey: ["gantt-workspaces", filter],
    queryFn: async () => {
      const { data } = await Api.post<GanttWorkspaceListResponse>({
        url: Urls.ganttWorkspaceList(),
        data: filter,
      });
      return data;
    },
  });
}
