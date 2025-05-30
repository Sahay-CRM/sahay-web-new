import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetDesignationDropdown() {
  const query = useQuery({
    queryKey: ["get-designation-dropdown"],
    queryFn: async () => {
      const { data: resData } = await Api.post<{
        data: DesignationDataProps[];
      }>({
        url: Urls.dropdownDesignation(),
      });
      return resData;
    },
  });
  return query;
}
