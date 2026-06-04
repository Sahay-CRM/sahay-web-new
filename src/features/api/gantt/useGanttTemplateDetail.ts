import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
import type {
  GanttTemplateDetailResponse,
  GanttTemplate,
  GanttTemplatePhase,
  GanttTemplateItem,
  GanttTemplateDependency,
} from "@/types/gantt";

// Shape returned by the current API endpoint
interface RawApiPhase extends Omit<GanttTemplatePhase, never> {
  items?: GanttTemplateItem[];
}

interface RawApiResponse extends GanttTemplate {
  phases?: RawApiPhase[];
  dependencies?: GanttTemplateDependency[];
  unphased?: GanttTemplateItem[];
}

function normalise(raw: unknown): GanttTemplateDetailResponse {
  const r = raw as RawApiResponse;
  if (r.ganttTemplateId) {
    const {
      phases: rawPhases = [],
      dependencies = [],
      unphased = [],
      ...templateFields
    } = r;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const phases: GanttTemplatePhase[] = rawPhases.map(
      ({ items: _items, ...p }) => p,
    );
    const itemsTree: GanttTemplateItem[] = [
      ...rawPhases.flatMap((p) => p.items ?? []),
      ...unphased,
    ];

    return {
      template: templateFields as unknown as GanttTemplate,
      phases,
      itemsTree,
      dependencies,
    };
  }

  // Old / already-normalised shape
  return raw as GanttTemplateDetailResponse;
}

export function useGanttTemplateDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["gantt-template-detail", id],
    queryFn: async () => {
      const { data } = await Api.post<{ data: unknown }>({
        url: Urls.ganttTemplateDetail(id!),
        data: {},
      });
      return normalise(data.data);
    },
    enabled: !!id,
  });
}
