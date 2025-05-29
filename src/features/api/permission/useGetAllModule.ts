import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetAllModule() {
  return useQuery({
    queryKey: ["get-module-list"],
    queryFn: async () => {
      const { data } = await Api.post<{ data: ModuleDetails[] }>({
        url: Urls.getAllModuleList(),
      });
      return data;
    },
  });
}
