import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetCoreParameterDropdown() {
  const query = useQuery({
    queryKey: ["get-core-parameter-dropdown"],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: CoreParameter[] }>({
        url: Urls.dropdownCoreParameter(),
      });
      return resData;
    },
  });
  return query;
}
