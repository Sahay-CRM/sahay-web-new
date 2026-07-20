/* eslint-disable @typescript-eslint/no-explicit-any */
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface SaveBlueprintPayload {
  companyId: string;
  coreValueIdsToCreate: string[];
  coreValueIdsToDelete: string[];
  whyWeExist: string;
  differentiation: string;
  
  // Goal updates for title / unit / description of existing objectives & subjectives
  goalUpdatesToSave?: Array<{
    companyBlueprintGoalId: string;
    unit?: string;
    description?: string;
    title?: string;
  }>;

  // List of year values to save for existing objectives/subjectives
  goalValuesToSave: Array<{
    companyBlueprintGoalId: string;
    year: number;
    value: number | null;
  }>;

  // New subjectives to create
  newSubjectives: Array<{
    title: string;
    unit?: string;
    description?: string;
    goalValues: Array<{
      year: number;
      value: number;
    }>;
  }>;

  deletedSubjectiveIds?: string[];
  deletedGoalValueIds?: string[];
}

export default function useSaveBlueprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveBlueprintPayload) => {
      const { 
        companyId, 
        coreValueIdsToCreate,
        coreValueIdsToDelete,
        whyWeExist, 
        differentiation, 
        goalUpdatesToSave = [],
        goalValuesToSave, 
        newSubjectives,
        deletedSubjectiveIds = [],
        deletedGoalValueIds = []
      } = payload;

      // 1. Assign Company Core Values (only if there are newly selected values)
      const coreValuesCreatePromise = coreValueIdsToCreate.length > 0
        ? Api.post({
            url: Urls.companyCoreValueCreate(),
            data: {
              companyId,
              coreValueIds: coreValueIdsToCreate,
              sortOrder: 1
            }
          })
        : Promise.resolve();

      // 2. Delete Unselected Company Core Values
      const coreValuesDeletePromises = coreValueIdsToDelete.map(id =>
        Api.delete({
          url: Urls.companyCoreValueDelete(id)
        })
      );

      // 3. Upsert Company Mission & Differentiation
      const missionPromise = Api.post({
        url: Urls.companyMissionUpsert(),
        data: {
          companyId,
          whyWeExist,
          differentiation
        }
      });

      // 4. Update Goal (title, unit, description) via company/blueprint-goal/update/:id
      const goalUpdatePromises = goalUpdatesToSave.map(item => {
        const updateData: Record<string, any> = {
          unit: item.unit || "",
          description: item.unit || item.description || ""
        };
        if (item.title !== undefined) {
          updateData.title = item.title;
        }

        return Api.put({
          url: Urls.companyBlueprintGoalUpdate(item.companyBlueprintGoalId),
          data: updateData
        }).catch(() => 
          Api.post({
            url: Urls.companyBlueprintGoalUpdate(item.companyBlueprintGoalId),
            data: updateData
          }).catch(() => {})
        );
      });

      // 5. Save individual year values for existing goals (Objectives & Subjectives)
      const saveValuesPromises = goalValuesToSave.map(item => 
        Api.post({
          url: Urls.companyGoalValueSave(),
          data: {
            companyBlueprintGoalId: item.companyBlueprintGoalId,
            year: item.year,
            value: item.value,
            remarks: ""
          }
        })
      );

      // 6. Create new Subjectives with unit & description
      const newSubjectivesPromises = newSubjectives.map(sub => 
        Api.post({
          url: Urls.companyBlueprintGoalCreate(),
          data: {
            companyId,
            type: "SUBJECTIVE",
            title: sub.title,
            unit: sub.unit || "",
            description: sub.unit || sub.description || "",
            goalValues: sub.goalValues
          }
        })
      );

      // 7. Handle deleted subjectives
      const deletePromises = deletedSubjectiveIds.map(id => 
        Api.delete({
          url: Urls.companyBlueprintGoalDelete(id)
        })
      );

      // 7. Handle deleted goal values
      const deleteGoalValuesPromises = deletedGoalValueIds.map(id => 
        Api.delete({
          url: Urls.companyGoalValueDelete(id)
        })
      );

      // Run all requests in parallel
      await Promise.all([
        coreValuesCreatePromise,
        ...coreValuesDeletePromises,
        missionPromise,
        ...goalUpdatePromises,
        ...saveValuesPromises,
        ...newSubjectivesPromises,
        ...deletePromises,
        ...deleteGoalValuesPromises
      ]);
    },
    onSuccess: (_, variables) => {
      toast.success("Blueprint saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["get-blueprint-data", variables.companyId] });
    },
    onError: (err: ErrorType) => {
      toast.error(err?.message || "Failed to save Blueprint. Please try again.");
    }
  });
}
