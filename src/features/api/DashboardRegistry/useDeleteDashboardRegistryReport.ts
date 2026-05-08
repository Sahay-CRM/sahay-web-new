import { useMutation, useQueryClient } from "@tanstack/react-query";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { toast } from "sonner";
import { AxiosError } from "axios";

export const useDeleteDashboardRegistryReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await Api.delete({
        url: Urls.deleteDashboardRegistry(id),
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Widget deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["dashboardRegistryReports"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });
};
