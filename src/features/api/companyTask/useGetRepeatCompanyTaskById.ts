import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetRepeatCompanyTaskById(id: string) {
  const query = useQuery({
    queryKey: ["get-repeattask-by-id", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Task ID is required");
      }
      const { data: resData } = await Api.post<{ data: Task }>({
        url: Urls.getRepeatCompanyTaskById(id),
      });

      return resData;
    },
  });
  return query;
}
