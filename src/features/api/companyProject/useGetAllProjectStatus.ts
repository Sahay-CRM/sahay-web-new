import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetAllProjectStatus({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-all-project-status-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: ProjectStatusRes[] }>({
        url: Urls.getAllDropdownProjectStatus(),
        data: filter,
      });

      return resData;
    },
    enabled: !!enable || !!filter,
  });
  return query;
}
