import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetUserPerById(adminUserId: string) {
  return useQuery({
    queryKey: ["get-adminUserPer-byId"],
    queryFn: async () => {
      const { data } = await Api.post<{ data: PermissionsResponse }>({
        url: Urls.userPermissionById(adminUserId),
      });
      return data;
    },
  });
}
