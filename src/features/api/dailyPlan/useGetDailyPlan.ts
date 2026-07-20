import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetDailyPlan(
  employeeId: string | undefined,
  date: string,
) {
  return useQuery({
    queryKey: ["daily-plan", employeeId, date],
    queryFn: async () => {
      const { data } = await Api.post<DailyPlanResponse>({
        url: Urls.getDailyPlan(),
        data: { employeeId, date },
      });
      return data;
    },
    enabled: Boolean(date),
  });
}
