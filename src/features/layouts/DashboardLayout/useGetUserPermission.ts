import { getUserDetail } from "@/features/selectors/auth.selector";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

export default function useGetUserPermission() {
  const user = useSelector(getUserDetail);

  const query = useQuery({
    queryKey: ["userPermission"],
    queryFn: async () => {
      if (!user?.employeeId) throw new Error("Missing user ID");
      const { data: resData } = await Api.post<{ data: PermissionsResponse }>({
        url: Urls.getUserPermission(user?.employeeId),
        data: {
          formatted: 1,
        },
      });
      return resData.data;
    },
    enabled: !!user?.employeeId,
  });

  return query;
}
