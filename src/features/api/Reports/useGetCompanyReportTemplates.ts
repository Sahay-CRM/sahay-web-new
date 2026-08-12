import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export interface ReportTemplate {
  reportTemplateId: string;
  templateName: string;
  templateDescription?: string;
  industryId: string;
  isDefault: boolean;
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
}

export interface GetReportTemplatesResponse {
  success: boolean;
  status: number;
  message: string;
  data: ReportTemplate[];
}

export default function useGetCompanyReportTemplates() {
  return useQuery({
    queryKey: ["company-report-templates"],
    queryFn: async () => {
      const { data: resData } = await Api.post<GetReportTemplatesResponse>({
        url: Urls.companyReportTemplateGet(),
        data: {},
      });
      return resData.data;
    },
  });
}
