import { useQuery } from "@tanstack/react-query";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";

export const useGetDashboardRegistryReports = () => {
  return useQuery<PaginatedResponse<DashboardRegistryReport[]>>({
    queryKey: ["dashboardRegistryReports"],
    queryFn: async () => {
      const response = await Api.post<
        PaginatedResponse<DashboardRegistryReport[]>
      >({
        url: Urls.getAllDashboardRegistry(),
        data: {},
      });
      return response.data;
    },
  });
};
