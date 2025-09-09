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
  const { data: kpiStructure } = useGetKpiDashboardStructure({
    filter: {
      filter: isDataFilter,
    },
  });

  const data = {
    frequencyType: selectedPeriod,
    selectDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
    filter: isDataFilter,
  };

  const { data: kpiData } = useGetKpiDashboardData({
    filter: data,
    enable: !!kpiStructure?.data?.length && !!selectedPeriod,
  });

  const frequencyArray = kpiStructure?.data?.map((item) => item.frequencyType);

  return {
    frequencyArray,
    kpiData,
  };
}
