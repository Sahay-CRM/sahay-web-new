import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export interface EmployeeJoiner {
  employeeId: string;
  employeeName: string;
}

export interface TodayMeeting {
  meetingId: string;
  meetingName: string;
  meetingStatus: string;
  detailMeetingStatus: string;
  meetingDateTime: string;
  description: string;
  isDetailMeeting: boolean;
  joiners: EmployeeJoiner[];
  statusColor?: string;
}

export interface TodayTask {
  taskId: string;
  taskName: string;
  status: string;
  deadline: string;
  statusColor?: string;
}

export interface TodayProject {
  projectId: string;
  projectName: string;
  status: string;
  deadline: string;
  statusColor?: string;
}

export interface PendencyTask {
  taskId: string;
  taskName: string;
  status: string;
  deadline: string;
  statusColor?: string;
}

export interface PendencyProject {
  projectId: string;
  projectName: string;
  status: string;
  deadline: string;
  statusColor?: string;
}

export interface TodayKpi {
  kpiId: string;
  kpiName: string;
  tag: string;
  frequency: string;
  isTodayFillData: boolean;
}

export interface EmployeeTodayPayload {
  myToday: {
    repeatTaskCount: number;
    completedTaskCount: number;
    pendingTaskCount: number;
    pendingCount: number;
    todayMeetings: TodayMeeting[];
    todayTasks: TodayTask[];
    projects: TodayProject[];
    kpis: TodayKpi[];
  };
  myPendencies: {
    tasks: PendencyTask[];
    projects: PendencyProject[];
  };
}

export interface EmployeeTodayResponse {
  success: boolean;
  status: number;
  message: string;
  data: EmployeeTodayPayload;
}

export default function useGetEmployeeToday() {
  return useQuery<EmployeeTodayResponse>({
    queryKey: ["get-employee-today"],
    queryFn: async () => {
      const { data } = await Api.get<EmployeeTodayResponse>({
        url: Urls.employeeToday(),
      });
      return data;
    },
  });
}
