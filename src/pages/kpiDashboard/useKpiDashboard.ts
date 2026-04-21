import {
  useGetKpiDashboardData,
  useGetKpiDashboardStructure,
} from "@/features/api/kpiDashboard";
import { format } from "date-fns";

export default function useKpiDashboard({
  selectedPeriod,
  selectedDate,
  isDataFilter,
  selectedEmployees,
  selectedDepartments,
}: {
  selectedPeriod: string;
  selectedDate: Date | null;
  isDataFilter?: string;
  selectedEmployees?: string[];
  selectedDepartments?: string[];
}) {
  const { data: kpiStructure } = useGetKpiDashboardStructure({
    filter: {
      sortBy: "sequence",
      sortOrder: "asc",
      filter: isDataFilter,
      employeeId: selectedEmployees,
      departmentId: selectedDepartments,
    },
  });

  const data = {
    frequencyType: selectedPeriod,
    selectDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
    filter: isDataFilter,
    employeeId: selectedEmployees,
    departmentId: selectedDepartments,
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
