import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

interface CompanyCoreValueItem {
  companyCoreValueId: string;
  companyId: string;
  blueprintCoreValueId?: string;
  CodeValueId?: string;
  codeValue?: string;
  coreValue?: string;
  actionStatement: string;
  sortOrder: number;
}

interface CompanyMissionItem {
  companyMissionId?: string;
  companyId: string;
  whyWeExist: string;
  differentiation: string;
}

interface YearlyGoalValue {
  companyBlueprintGoalValueId: string;
  companyBlueprintGoalId: string;
  year: number;
  value: number;
  remarks?: string;
}

interface CompanyBlueprintGoalItem {
  companyBlueprintGoalId: string;
  companyId: string;
  type: "OBJECTIVE" | "SUBJECTIVE";
  blueprintGoalObjectiveId?: string;
  objectiveTitle?: string;
  title?: string;
  description?: string;
  BlueprintGoalObjective?: {
    blueprintGoalObjectiveId?: string;
    title?: string;
    description?: string;
    isActive?: boolean;
  };
  goalValues: YearlyGoalValue[];
}

export interface ConsolidatedBlueprintData {
  coreValues: CompanyCoreValueItem[];
  mission: CompanyMissionItem | null;
  objectives: CompanyBlueprintGoalItem[];
  subjectives: CompanyBlueprintGoalItem[];
}

export default function useGetBlueprint(companyId?: string) {
  return useQuery({
    queryKey: ["get-blueprint-data", companyId],
    queryFn: async (): Promise<ConsolidatedBlueprintData | null> => {
      if (!companyId) return null;

      const [coreValuesRes, missionRes, objectivesRes, subjectivesRes] = await Promise.all([
        Api.post<{ data: CompanyCoreValueItem[] }>({
          url: Urls.companyCoreValueGetAll(),
          data: { companyId }
        }).catch(() => ({ data: { data: [] } })),

        Api.post<{ data: CompanyMissionItem }>({
          url: Urls.companyMissionGet(),
          data: { companyId }
        }).catch(() => ({ data: { data: null } })),

        Api.post<{ data: CompanyBlueprintGoalItem[] }>({
          url: Urls.companyBlueprintGoalGetAll(),
          data: { companyId, type: "OBJECTIVE", search: "" }
        }).catch(() => ({ data: { data: [] } })),

        Api.post<{ data: CompanyBlueprintGoalItem[] }>({
          url: Urls.companyBlueprintGoalGetAll(),
          data: { companyId, type: "SUBJECTIVE", search: "" }
        }).catch(() => ({ data: { data: [] } }))
      ]);

      return {
        coreValues: coreValuesRes.data.data || [],
        mission: missionRes.data.data || null,
        objectives: objectivesRes.data.data || [],
        subjectives: subjectivesRes.data.data || []
      };
    },
    enabled: !!companyId
  });
}
export type { CompanyCoreValueItem, CompanyMissionItem, YearlyGoalValue, CompanyBlueprintGoalItem };
