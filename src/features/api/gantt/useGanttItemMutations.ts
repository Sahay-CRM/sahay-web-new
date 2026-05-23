import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import type {
  CreateGanttItemRequest,
  UpdateGanttItemRequest,
  UpdateGanttProgressRequest,
  UpdateGanttDatesRequest,
  AssignGanttItemRequest,
  CompanyGanttItem,
} from "@/types/gantt";

function invalidateWorkspace(workspaceId: string) {
  queryClient.invalidateQueries({
    queryKey: ["gantt-workspace-detail", workspaceId],
  });
}

export function useCreateGanttItem(workspaceId: string) {
  return useMutation({
    mutationFn: async (payload: CreateGanttItemRequest) => {
      const { data } = await Api.post<{
        data: CompanyGanttItem;
        message: string;
      }>({
        url: Urls.ganttItemCreate(),
        data: payload,
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Item created");
      invalidateWorkspace(workspaceId);
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message || "Failed to create item");
    },
  });
}

export function useUpdateGanttItem(workspaceId: string, itemId: string) {
  return useMutation({
    mutationFn: async (payload: UpdateGanttItemRequest) => {
      const { data } = await Api.put<{ data: unknown; message: string }>({
        url: Urls.ganttItemUpdate(itemId),
        data: payload,
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Item updated");
      invalidateWorkspace(workspaceId);
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message || "Failed to update item");
    },
  });
}

export function useDeleteGanttItem(workspaceId: string) {
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await Api.delete<{ message: string }>({
        url: Urls.ganttItemDelete(itemId),
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Item deleted");
      invalidateWorkspace(workspaceId);
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message || "Failed to delete item");
    },
  });
}

export function useUpdateGanttProgress(workspaceId: string) {
  return useMutation({
    mutationFn: async ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: UpdateGanttProgressRequest;
    }) => {
      const { data } = await Api.put<{ data: unknown; message: string }>({
        url: Urls.ganttItemProgress(itemId),
        data: payload,
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Progress updated");
      invalidateWorkspace(workspaceId);
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message || "Failed to update progress");
    },
  });
}

export function useUpdateGanttDates(workspaceId: string) {
  return useMutation({
    mutationFn: async ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: UpdateGanttDatesRequest;
    }) => {
      const { data } = await Api.put<{ data: unknown; message: string }>({
        url: Urls.ganttItemDates(itemId),
        data: payload,
      });
      return data;
    },
    onSuccess: () => {
      invalidateWorkspace(workspaceId);
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message || "Failed to update dates");
    },
  });
}

export function useAssignGanttItem(workspaceId: string) {
  return useMutation({
    mutationFn: async ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: AssignGanttItemRequest;
    }) => {
      const { data } = await Api.put<{ data: unknown; message: string }>({
        url: Urls.ganttItemAssign(itemId),
        data: payload,
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Assignment updated");
      invalidateWorkspace(workspaceId);
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message || "Failed to assign item");
    },
  });
}
