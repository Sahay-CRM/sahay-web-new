import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";



export interface DailyPlanTask {
  taskId: string;
  taskName: string;
  taskDescription?: string | null;
}

export interface DailyPlanMeeting {
  meetingId: string;
  meetingName: string;
  meetingDescription?: string | null;
}

export interface PlanDataItem {
  planItemId: string;
  planId: string;
  employeeId: string;
  type: "TASK" | "MEETING";
  taskId?: string | null;
  meetingId?: string | null;
  estimatedTime?: number;
  actualTime?: number | null;
  status: string;
  task?: DailyPlanTask | null;
  meeting?: DailyPlanMeeting | null;
  isPlanned?: boolean | null;
}

export interface OtherItem {
  taskId?: string;
  taskName?: string;
  taskDescription?: string | null;
  meetingId?: string;
  meetingName?: string;
  meetingDescription?: string | null;
}

export interface GetDailyPlanItemsResponse {
  plandata: PlanDataItem[];
  other: OtherItem[];
}

interface GetDailyPlanItemsFilter {
  type: "TASK" | "MEETING";
  search?: string;
}

export default function useGetDailyPlanItems(
  filter: GetDailyPlanItemsFilter,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["get-daily-plan-items", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: GetDailyPlanItemsResponse }>({
        url: Urls.getDailyPlanItems(),
        data: filter,
      });
      return resData?.data || { plandata: [], other: [] };
    },
    enabled: enabled && !!filter.type,
  });
}
