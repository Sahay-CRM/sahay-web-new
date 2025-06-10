import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetDepartment({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-department-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DepartmentResponse>({
        url: Urls.getDepartmentList(),
        data: {
          ...filter,
        },
      });

      return resData;
    },
  });
  return query;
}
