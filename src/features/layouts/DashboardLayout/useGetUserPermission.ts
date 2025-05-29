import { getUserDetail } from "@/features/selectors/auth.selector";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

export default function useGetUserPermission() {
  const user = useSelector(getUserDetail);

  const id = user?.adminUserId;

  const query = useQuery({
    queryKey: ["userPermission", id],
    queryFn: async () => {
      if (!user?.employeeId) throw new Error("Missing user ID");
      const { data: resData } = await Api.post<Response>({
        url: Urls.getUserPermission(user?.employeeId),
        data: {
          formatted: 1,
        },
      });
      return resData.data;
    },
    enabled: !!id,
  });

  return query;
}
