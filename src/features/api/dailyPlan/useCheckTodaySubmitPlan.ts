import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

interface CheckTodaySubmitPlanResponse {
  data: {
    isSubmitted: boolean;
  } | boolean;
  message?: string;
}

export default function useCheckTodaySubmitPlan() {
  return useQuery({
    queryKey: ["check-today-submit-plan"],
    queryFn: async () => {
      const { data } = await Api.post<CheckTodaySubmitPlanResponse>({
        url: Urls.checkTodaySubmitPlan(),
      });
      return data;
    },
  });
}
