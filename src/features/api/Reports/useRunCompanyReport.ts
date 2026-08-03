import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
import { CompanyReport } from "./useGetCompanyReports";

export interface RunCompanyReportResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    report?: CompanyReport;
    result?: Record<string, unknown>[];
    reportId?: string;
    reportName?: string;
    reportDescription?: string;
    columns?: string[];
    rows?: Record<string, unknown>[];
    reportConfig?: {
      module?: string;
      sort?: unknown;
      filters?: { field: string }[];
    };
  };
}

export default function useRunCompanyReport(id?: string) {
  return useQuery({
    queryKey: ["run-company-report", id],
    queryFn: async () => {
      if (!id) return null;
      const { data: resData } = await Api.post<RunCompanyReportResponse>({
        url: Urls.companyReportRun(id),
        data: null,
      });
      return resData.data;
    },
    enabled: !!id,
  });
}
