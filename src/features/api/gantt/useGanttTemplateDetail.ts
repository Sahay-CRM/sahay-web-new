import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
import type { GanttTemplateDetailResponse } from "@/types/gantt";

export function useGanttTemplateDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["gantt-template-detail", id],
    queryFn: async () => {
      const { data } = await Api.post<{ data: GanttTemplateDetailResponse }>({
        url: Urls.ganttTemplateDetail(id!),
        data: {},
      });
      return data.data;
    },
    enabled: !!id,
  });
}
