import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export interface ReportsResponse {
  success: boolean;
  status: number;
  message: string;
  data: CompanyPerformanceReport;
}

export default function useGetReports() {
  return useQuery({
    queryKey: ["get-reports"],
    queryFn: async () => {
      const { data: resData } = await Api.post<ReportsResponse>({
        url: Urls.getReports(),
        data: {},
      });
      return resData.data;
    },
  });
}
