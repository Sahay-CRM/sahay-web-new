import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetCompanySubProjects(id: string) {
  const query = useQuery({
    queryKey: ["get-company-sub-projects", id],
    queryFn: async () => {
      const { data: resData } = await Api.post<{
        data: CompanyProjectDataProps;
      }>({
        url: Urls.getCompanySubProjects(id),
      });

      return resData;
    },
    enabled: !!id,
    staleTime: 0,
  });

  return query;
}
