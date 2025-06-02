import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetDepartmentDropdown() {
  const query = useQuery({
    queryKey: ["get-department-dropdown"],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: DepartmentData[] }>({
        url: Urls.dropdownDepartment(),
      });
      return resData;
    },
  });
  return query;
}
