import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type GroupRes = BaseResponse<GroupData>;

export default function useGetAllGroup() {
  return useQuery({
    queryKey: ["get-group-list"],
    queryFn: async () => {
      const { data } = await Api.post<GroupRes>({
        url: Urls.getGroupList(),
      });
      return data;
    },
  });
}
