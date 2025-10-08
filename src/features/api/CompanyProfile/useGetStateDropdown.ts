import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type StateRes = BaseResponse<StateData>;

export default function useGetStateDropdown({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-state-dropdown", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<StateRes>({
        url: Urls.dropdownState(),
        data: filter,
      });
      return resData;
    },
    enabled: !!enable || !!filter,
  });
  return query;
}
