import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type GroupRes = BaseResponse<GroupData>;

export default function useGetAllGroup({ filter, enable }: FilterDataProps) {
  return useQuery({
    queryKey: ["get-group-list", filter],
    queryFn: async () => {
      const { data } = await Api.post<GroupRes>({
        url: Urls.getGroupList(),
        data: filter,
      });
      return data;
    },
    enabled: !!enable || !!filter,
  });
}
