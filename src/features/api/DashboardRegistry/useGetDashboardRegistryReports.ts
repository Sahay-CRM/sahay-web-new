import { useQuery } from "@tanstack/react-query";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import {
  ApiResponse,
  DashboardRegistryReport,
} from "@/components/shared/DashboardBuilder/DashboardBuilderRegistry";

export const useGetDashboardRegistryReports = () => {
  return useQuery<ApiResponse<DashboardRegistryReport[]>>({
    queryKey: ["dashboardRegistryReports"],
    queryFn: async () => {
      const response = await Api.post<ApiResponse<DashboardRegistryReport[]>>({
        url: Urls.getAllDashboardRegistry(),
        data: {},
      });
      return response.data;
    },
  });
};
