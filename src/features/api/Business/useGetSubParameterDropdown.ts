import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetSubParameterDropdown({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-sub-parameter-dropdown", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: SubParameter[] }>({
        url: Urls.dropdownSubParameter(),
        data: filter,
      });
      return resData;
    },
    enabled: !!enable,
  });
  return query;
}
