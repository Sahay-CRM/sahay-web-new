import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import store from "@/features/store";
import type {
  CreateGanttPhaseRequest,
  UpdateGanttPhaseRequest,
  ReorderGanttPhasesRequest,
  CompanyGanttPhase,
} from "@/types/gantt";

function invalidateWorkspace(workspaceId: string) {
  queryClient.invalidateQueries({
    queryKey: ["gantt-workspace-detail", workspaceId],
  });
}

export function useCreateGanttPhase(workspaceId: string) {
  return useMutation({
    mutationFn: async (payload: CreateGanttPhaseRequest) => {
      const { data } = await Api.post<{
        data: CompanyGanttPhase;
        message: string;
      }>({
        url: Urls.ganttPhaseCreate(),
        data: payload,
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Phase created successfully");
      invalidateWorkspace(workspaceId);
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message || "Failed to create phase");
    },
  });
}

export function useUpdateGanttPhase(workspaceId: string) {
  return useMutation({
    mutationFn: async ({
      phaseId,
      payload,
    }: {
      phaseId: string;
      payload: UpdateGanttPhaseRequest;
    }) => {
      const { data } = await Api.put<{
        data: CompanyGanttPhase;
        message: string;
      }>({
        url: Urls.ganttPhaseUpdate(phaseId),
        data: payload,
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Phase updated successfully");
      invalidateWorkspace(workspaceId);
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message || "Failed to update phase");
    },
  });
}

export function useDeleteGanttPhase(workspaceId: string) {
  return useMutation({
    mutationFn: async ({
      phaseId,
      isBothDelete,
    }: {
      phaseId: string;
      isBothDelete: boolean;
    }) => {
      const token = store.getState().auth.token;
      const { data } = await axios.delete<{ message: string }>(
        Urls.ganttPhaseDelete(phaseId),
        {
          headers: {
            authorization: token ? `Bearer ${token}` : "",
          },
          data: { isBothDelete },
        }
      );
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Phase archived successfully");
      invalidateWorkspace(workspaceId);
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message || "Failed to delete phase");
    },
  });
}

export function useReorderGanttPhases(workspaceId: string) {
  return useMutation({
    mutationFn: async (payload: ReorderGanttPhasesRequest) => {
      const { data } = await Api.post<{ message: string }>({
        url: Urls.ganttPhaseReorder(),
        data: payload,
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Phases reordered successfully");
      invalidateWorkspace(workspaceId);
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message || "Failed to reorder phases");
    },
  });
}
