import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetAllProjectStatus() {
  const query = useQuery({
    queryKey: ["get-all-project-status-list"],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: ProjectStatusRes }>({
        url: Urls.getAllDropdownProjectStatus(),
      });

      return resData;
    },
  });
  return query;
}
