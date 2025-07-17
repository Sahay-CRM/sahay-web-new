import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetUserNotification() {
  const query = useQuery({
    queryKey: ["userNotifications"],
    queryFn: async () => {
      const { data: resData } = await Api.post<{
        data: AppNotification[];
        totalCount: number;
      }>({
        url: Urls.getUserFireNotification(),
      });

      return resData;
    },
    staleTime: 0,
  });
  return query;
}
