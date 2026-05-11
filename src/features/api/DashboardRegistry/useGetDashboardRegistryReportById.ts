import { useQuery } from "@tanstack/react-query";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";

export const useGetDashboardRegistryReportById = (id?: string) => {
  return useQuery<ApiResponse<DashboardRegistryReport>>({
    queryKey: ["dashboardRegistryReport", id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      const response = await Api.post<ApiResponse<DashboardRegistryReport>>({
        url: Urls.getDashboardRegistryById(id),
      });
      return response.data;
    },
    enabled: !!id,
  });
};
