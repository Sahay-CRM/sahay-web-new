import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useDeleteCompanyReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reportId: string) => {
      const { data: resData } = await Api.delete<{ success: boolean; message: string }>({
        url: Urls.companyReportLibraryDelete(reportId),
      });
      return resData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-reports"] });
    },
  });
}
