import { useQuery } from "@tanstack/react-query";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";

type DatePaging = ApiResponse<Registry>;

export const useGetDashboardRegistryData = () => {
  return useQuery({
    queryKey: ["dashboardRegistryData"],
    queryFn: async () => {
      const response = await Api.post<DatePaging>({
        url: Urls.getAllDashboardRegistryData(),
        data: {},
      });
      return response.data;
    },
  });
};
