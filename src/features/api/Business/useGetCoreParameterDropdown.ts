import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetCoreParameterDropdown({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-core-parameter-dropdown", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: CoreParameter[] }>({
        url: Urls.dropdownCoreParameter(),
        data: filter,
      });
      return resData;
    },
    enabled: !!enable || !!filter,
  });
  return query;
}
