import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetSubParaByLevel({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-Sub-ParaByCore", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: SubParaByCorePara[] }>({
        url: Urls.getSubParaByCorePara(),
        data: filter,
      });
      return resData.data;
    },
    enabled: !!enable && !!filter,
  });
  return query;
}
