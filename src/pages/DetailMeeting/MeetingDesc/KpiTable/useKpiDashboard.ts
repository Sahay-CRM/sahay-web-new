import {
  useGetKpiDashboardData,
  useGetKpiDashboardStructure,
} from "@/features/api/kpiDashboard";
import { format } from "date-fns";

export default function useKpiDashboard({
  selectedPeriod,
  selectedDate,
}: {
  selectedPeriod: string;
  selectedDate: Date | null;
}) {
  const { data: kpiStructure } = useGetKpiDashboardStructure({
    filter: {},
  });

  const data = {
    frequencyType: selectedPeriod,
    selectDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
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
