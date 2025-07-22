import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type ObjectiveRes = BaseResponse<ObjectiveProps>;

export default function useGetObjective({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-objective-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<ObjectiveRes>({
        url: Urls.getObjective(),
        data: {
          ...filter,
        },
      });

      return resData;
    },
  });
  return query;
}
