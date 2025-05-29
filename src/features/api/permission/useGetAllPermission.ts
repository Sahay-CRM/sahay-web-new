import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetAllPermission() {
  return useQuery({
    queryKey: ["get-permission-list"],
    queryFn: async () => {
      const { data } = await Api.post<{ data: PermissionDetails[] }>({
        url: Urls.getAllPermissionList(),
      });
      return data;
    },
  });
}
