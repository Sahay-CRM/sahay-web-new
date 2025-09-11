import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetDepartmentDropdown({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-department-dropdown", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: DepartmentData[] }>({
        url: Urls.dropdownDepartment(),
        data: filter,
      });
      return resData;
    },
    enabled: !!enable || !!filter,
  });
  return query;
}
