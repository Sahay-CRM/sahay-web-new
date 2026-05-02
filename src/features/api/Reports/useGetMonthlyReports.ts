import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

interface MonthlyReportRequest {
  month: string; // e.g., "April"
  year: string; // e.g., "2026"
}

export interface MonthlyReportResponse {
  success: boolean;
  status: number;
  message: string;
  data: MonthlyReportRequest;
}

export default function useGetMonthlyReports(selectedMonthLabel: string) {
  return useQuery({
    queryKey: ["get-monthly-reports", selectedMonthLabel],
    queryFn: async () => {
      // Assuming selectedMonthLabel is in format "April 2026"
      const [m, y] = selectedMonthLabel.split(" ");

      const { data: resData } = await Api.post<MonthlyReportResponse>({
        url: Urls.getMonthlyReports(),
        data: {
          month: m.toLowerCase().trim(),
          year: y.trim(),
        },
      });
      return resData.data;
    },
    enabled: !!selectedMonthLabel,
  });
}
