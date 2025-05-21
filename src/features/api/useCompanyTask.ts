import { useQuery } from "@tanstack/react-query";
import Api from "../utils/api.utils";
import Urls from "../utils/urls.utils";

// In useGetTaskPriority hook
export default function useCompanyTask() {
  const query = useQuery({
    queryKey: ["getTask"],
    queryFn: async () => {
      const { data: resData } = await Api.get({
        url: Urls.CompanyTask(),
      });

      return resData;
    },
  });

  return query;
}
