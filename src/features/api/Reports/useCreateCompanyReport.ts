import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface CreateCompanyReportPayload {
  reportTemplateId: string;
  reportName: string;
  reportDescription?: string;
}

export default function useCreateCompanyReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCompanyReportPayload) => {
      const { data: resData } = await Api.post<{ success: boolean; message: string }>({
        url: Urls.companyReportLibraryCreateFromTemplate(),
        data: payload,
      });
      return resData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-reports"] });
    },
  });
}
