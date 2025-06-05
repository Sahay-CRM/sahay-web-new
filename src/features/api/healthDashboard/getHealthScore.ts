import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

interface CompanyResult {
  totalWeightage: number;
  totalScore: number;
  healthPercentage: number;
}

interface IndividualResult {
  coreParameterId: string;
  totalWeightageCP: number;
  totalScoreCP: number;
  healthPercentage: number;
}

interface HealthScoreResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    companyResult: CompanyResult;
    individualResult: IndividualResult[];
  };
}

type HealthRes = BaseResponse<HealthScoreResponse>;

export default function useGetHealthScore({ filter }: FilterDataProps) {
  return useQuery({
    queryKey: ["get-healthScore-list", filter],
    queryFn: async () => {
      const { data } = await Api.post<HealthRes>({
        url: Urls.getHealthScoreList(),
        data: filter,
      });
      return data;
    },
    enabled: !!filter,
  });
}
