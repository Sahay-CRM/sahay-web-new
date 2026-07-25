import { AxiosError } from "axios";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface SaveBlueprintPayload {
  companyId: string;
  mission: {
    whyWeExist: string;
    differentiation: string;
  };

  coreValues: Array<{
    coreValueId: string;
    sortOrder: number;
  }>;

  goals: Array<{
    companyBlueprintGoalId?: string;
    type?: string;
    title?: string;
    unit?: string;
    description?: string;
    goalValues?: Array<{
      year: number;
      value: number | null;
      remarks?: string;
    }>;
  }>;

  goalValues: Array<{
    companyBlueprintGoalId: string;
    year: number;
    value: number | null;
    remarks?: string;
  }>;
}

export default function useSaveBlueprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveBlueprintPayload) => {
      return Api.post({
        url: Urls.companyBlueprintGoalSaveAll(),
        data: payload
      });
    },
    onSuccess: (_, variables) => {
      toast.success("Blueprint saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["get-blueprint-data", variables.companyId] });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error((err.response?.data )?.message || err?.message || "Failed to save Blueprint. Please try again.");
    }
  });
}
