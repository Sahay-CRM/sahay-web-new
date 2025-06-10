import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetCompanyLevel(coreParameterId: string) {
  const query = useQuery({
    queryKey: ["get-company-level-core", coreParameterId],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: CompanyLevelRes[] }>({
        url: Urls.getCompanyLevelByCore(),
        data: {
          coreParameterId: coreParameterId,
        },
      });
      return resData;
    },
    enabled: !!coreParameterId,
  });
  return query;
}
