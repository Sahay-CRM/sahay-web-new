import { useMutation, useQueryClient } from "@tanstack/react-query";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { WidgetConfig } from "@/components/shared/DashboardBuilder/DashboardBuilderRegistry";
import { toast } from "sonner";
import { AxiosError } from "axios";

export const useUpdateDashboardRegistryReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      config,
    }: {
      id: string;
      config: WidgetConfig;
    }) => {
      const response = await Api.post({
        url: Urls.updateDashboardRegistry(id),
        data: config,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Widget updated successfully");
      queryClient.invalidateQueries({ queryKey: ["dashboardRegistryReports"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });
};
