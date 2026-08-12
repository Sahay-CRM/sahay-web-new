import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
import useDebounce from "@/hooks/useDebounce";

interface GanttTodayItemsPayload {
  date: string;
  search?: string;
}



export default function useGetGanttItems(
  filter: GanttTodayItemsPayload,
  enabled?: boolean
) {
  const debouncedSearch = useDebounce(filter.search || "", 300);

  return useQuery({
    queryKey: ["get-gantt-items-today", filter.date, debouncedSearch],
    queryFn: async () => {
      const { data } = await Api.post<GanttTodayItemsResponse>({
        url: Urls.ganttTodayItems(),
        data: {
          date: filter.date,
          search: debouncedSearch,
        },
      });
      return data;
    },
    enabled: enabled !== undefined ? enabled : true,
  });
}
