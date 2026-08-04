import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export interface CompanyReport {
  reportId: string;
  reportName: string;
  reportDescription?: string;
  viewType?: string;
  reportConfig: {
    module: string;
    title: string;
    columns: string[];
    filters: Array<{
      field: string;
      operator: string;
      value: string | number | boolean | null;
    }>;
    sort: {
      field: string;
      order: "asc" | "desc";
    };
  };
  isActive: boolean;
  createdDatetime: string;
}

export interface GetCompanyReportsResponse {
  success: boolean;
  status: number;
  message: string;
  data: CompanyReport[];
}

export default function useGetCompanyReports() {
  return useQuery({
    queryKey: ["company-reports"],
    queryFn: async () => {
      const { data: resData } = await Api.post<GetCompanyReportsResponse>({
        url: Urls.companyReportLibraryGet(),
        data: {},
      });
      return resData.data;
    },
  });
}
