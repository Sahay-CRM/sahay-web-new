import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

interface GetKpiNotAssignedProps {
  employeeId: string;
  enable?: boolean;
}

export default function useGetKpiNotAssignedToEmployee({
  employeeId,
  enable = true,
}: GetKpiNotAssignedProps) {
  const query = useQuery({
    queryKey: ["kpi-list-not-assigned", employeeId],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: KpiAllList[] }>({
        url: Urls.getKpiNotAssignedToEmployee(),
        data: {
          employeeId,
        },
      });

      return resData;
    },
    enabled: !!enable && !!employeeId,
  });
  return query;
}
