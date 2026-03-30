import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export interface ReportMetric {
  total: number;
  completed: number;
  status: string;
}

export interface DayReportItem {
  date: string;
  task: ReportMetric;
  project: ReportMetric;
  meeting: ReportMetric;
}

export interface ReportsResponse {
  companyId: string;
  companyName: string;
  dailyReport: DayReportItem[];
}

export default function useGetReports() {
  return useQuery({
    queryKey: ["get-reports"],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: ReportsResponse }>({
        url: Urls.getReports(),
        data: {},
      });
      return resData.data;
    },
  });
}
