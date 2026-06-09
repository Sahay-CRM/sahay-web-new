import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import type {
  CreateGanttWorkspaceRequest,
  CreateWorkspaceFromTemplateRequest,
  CreateWorkspaceFromTemplateResponse,
  UpdateGanttWorkspaceRequest,
} from "@/types/gantt";

export function useCreateGanttWorkspace() {
  return useMutation({
    mutationFn: async (payload: CreateGanttWorkspaceRequest) => {
      const { data } = await Api.post<{
        data: { ganttWorkspaceId: string };
        message: string;
      }>({
        url: Urls.ganttWorkspaceCreate(),
        data: payload,
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Workspace created");
      queryClient.invalidateQueries({ queryKey: ["gantt-workspaces"] });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message || "Failed to create workspace");
    },
  });
}

export function useCreateWorkspaceFromTemplate() {
  return useMutation({
    mutationFn: async (payload: CreateWorkspaceFromTemplateRequest) => {
      const { data } = await Api.post<{
        data: CreateWorkspaceFromTemplateResponse;
        message: string;
      }>({
        url: Urls.ganttWorkspaceCreateFromTemplate(),
        data: payload,
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Workspace generated from template");
      queryClient.invalidateQueries({ queryKey: ["gantt-workspaces"] });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(
        err.response?.data?.message || "Failed to generate workspace",
      );
    },
  });
}

export function useUpdateGanttWorkspace(id: string) {
  return useMutation({
    mutationFn: async (payload: UpdateGanttWorkspaceRequest) => {
      const { data } = await Api.put<{ data: unknown; message: string }>({
        url: Urls.ganttWorkspaceUpdate(id),
        data: payload,
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Workspace updated");
      queryClient.invalidateQueries({ queryKey: ["gantt-workspaces"] });
      queryClient.invalidateQueries({
        queryKey: ["gantt-workspace-detail", id],
      });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message || "Failed to update workspace");
    },
  });
}

export function useDeleteGanttWorkspace() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await Api.delete<{ message: string }>({
        url: Urls.ganttWorkspaceDelete(id),
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Workspace deleted");
      queryClient.invalidateQueries({ queryKey: ["gantt-workspaces"] });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message || "Failed to delete workspace");
    },
  });
}
