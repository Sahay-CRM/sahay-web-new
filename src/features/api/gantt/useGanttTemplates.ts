import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
import type {
  GanttTemplate,
  GanttTemplateListRequest,
  GanttTemplateListResponse,
} from "@/types/gantt";

export function useGanttTemplates(filter: GanttTemplateListRequest) {
  return useQuery({
    queryKey: ["gantt-templates", filter],
    queryFn: async () => {
      const { data } = await Api.post<GanttTemplateListResponse>({
        url: Urls.ganttTemplateList(),
        data: filter,
      });
      return data;
    },
  });
}

export function useGanttTemplatesGetAll() {
  return useQuery({
    queryKey: ["gantt-templates-get-all"],
    queryFn: async () => {
      const { data } = await Api.post<{
        success: boolean;
        data: GanttTemplate[];
        message: string;
      }>({
        url: Urls.ganttTemplateGetAll(),
      });
      return data;
    },
  });
}
