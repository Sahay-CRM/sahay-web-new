import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export interface GroupKpiSubItem {
  srNo: number;
  dataPointName?: string;
  dataPointLabel?: string;
  KPIMasterId: string;
  KPIName: string;
  KPILabel: string;
  CoreParameter?: any;
  coreParameterName?: string | null;
  coreParameterId?: string | null;
  tag: string;
  empTags?: any[];
  validationType: string;
  frequencyType: string;
  selectedType?: any;
  unit: string | null;
  visualFrequencyTypes: string | null;
  employeeId: string;
  value1: string;
  value2: string | null;
  createdBy: string;
  updatedBy?: string | null;
  isDelete: boolean;
  employeeName: string;
  kpiId: string;
  isFocus: boolean;
  isOwnKpi: boolean;
  kpiPermission: string;
}

export interface GroupKpiItem {
  kpiMergeId: string;
  kpiMergeName: string;
  tag: string;
  validationType: string;
  unit: string;
  frequencyType: string;
  visualFrequencyTypes: string | null;
  visualFrequencyAggregate: string;
  value1: string;
  value2: string | null;
  isMinusKpi: boolean;
  isDelete: boolean;
  kpiIds: string[];
  baseKpiIds: string[];
  otherKpiIds: string[];
  kpis: GroupKpiSubItem[];
}

export default function useGetAllKpiMerge(enable: boolean = true) {
  return useQuery({
    queryKey: ["get-all-kpi-merge"],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: GroupKpiItem[] }>({
        url: Urls.getAllKpiMerge(),
      });
      return resData.data || [];
    },
    enabled: enable,
  });
}
