import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetCompanyLevel({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-company-level-core", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: CompanyLevelRes[] }>({
        url: Urls.getCompanyLevelByCore(),
        data: filter,
      });
      return resData;
    },
    enabled: !!enable || !!filter,
  });
  return query;
}
