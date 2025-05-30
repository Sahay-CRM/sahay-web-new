import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type DesignationRes = BaseResponse<DesignationDetails>;

export default function useGetDesignation({ filter }: FilterDataProps) {
  return useQuery({
    queryKey: ["get-designation-list", filter],
    queryFn: async () => {
      const { data } = await Api.post<DesignationRes>({
        url: Urls.getDesignationList(),
        data: filter,
      });
      return data;
    },
    enabled: !!filter,
  });
}
