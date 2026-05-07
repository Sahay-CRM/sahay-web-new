import {
  useGetKpiDashboardData,
  useGetKpiDashboardStructure,
} from "@/features/api/kpiDashboard";
import { format } from "date-fns";

export default function useKpiDashboard({
  selectedPeriod,
  selectedDate,
  isDataFilter,
}: {
  selectedPeriod: string;
  selectedDate: Date | null;
  isDataFilter?: string;
}) {
  const { data: kpiStructure }: { data?: BaseResponse<FrequencyData> } =
    useGetKpiDashboardStructure({
      filter: {
        sortBy: "sequence",
        sortOrder: "asc",
        filter: isDataFilter,
      },
    });

  const data = {
    frequencyType: selectedPeriod,
    selectDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
    filter: isDataFilter,
  };

  const {
    data: kpiData,
    isLoading,
    isFetching,
  } = useGetKpiDashboardData({
    filter: data,
    enable: !!kpiStructure?.data?.length && !!selectedPeriod,
  });

  const frequencyArray = kpiStructure?.data?.map((item) => item.frequencyType);

  return {
    frequencyArray,
    kpiData,
    isLoading: isLoading || isFetching,
  };
}
