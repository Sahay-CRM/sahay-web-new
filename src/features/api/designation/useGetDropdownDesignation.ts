import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetDesignationDropdown({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-designation-dropdown", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<{
        data: DesignationDataProps[];
      }>({
        url: Urls.dropdownDesignation(),
        data: filter,
      });
      return resData;
    },
  });
  return query;
}
