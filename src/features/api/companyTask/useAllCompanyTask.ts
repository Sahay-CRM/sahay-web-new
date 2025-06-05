import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useAllCompanyTask() {
  const query = useQuery({
    queryKey: ["get-all-task-dropdown"],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: TaskGetPaging }>({
        url: Urls.getAllCompanyTask(),
      });

      return resData;
    },
  });
  return query;
}
