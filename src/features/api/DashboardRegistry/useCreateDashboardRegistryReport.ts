import { useMutation, useQueryClient } from "@tanstack/react-query";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";

export const useCreateDashboardRegistryReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: WidgetConfig) => {
      const response = await Api.post({
        url: Urls.createDashboardRegistry(),
        data: config,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardRegistryReports"] });
    },
  });
};
