import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetForm(id: string) {
  const query = useQuery({
    queryKey: ["get-form-by-id", id],
    queryFn: async () => {
      const { data: resData } = await Api.post<FormResponse>({
        url: Urls.getForm(id),
      });
      return resData;
    },
    enabled: !!id,
  });
  return query;
}
