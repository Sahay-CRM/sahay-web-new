import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import type { CreateGanttDependencyRequest } from "@/types/gantt";

export function useCreateGanttDependency(workspaceId: string) {
  return useMutation({
    mutationFn: async (payload: CreateGanttDependencyRequest) => {
      const { data } = await Api.post<{ data: unknown; message: string }>({
        url: Urls.ganttDependencyCreate(),
        data: payload,
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Dependency created");
      queryClient.invalidateQueries({
        queryKey: ["gantt-workspace-detail", workspaceId],
      });
    },
    onError: (err: AxiosError<{ message?: string; statusCode?: number }>) => {
      const msg = err.response?.data?.message;
      if (err.response?.status === 409) {
        toast.error(
          msg || "Circular dependency detected — cannot create this link",
        );
      } else {
        toast.error(msg || "Failed to create dependency");
      }
    },
  });
}

export function useDeleteGanttDependency(workspaceId: string) {
  return useMutation({
    mutationFn: async (dependencyId: string) => {
      const { data } = await Api.delete<{ message: string }>({
        url: Urls.ganttDependencyDelete(dependencyId),
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Dependency removed");
      queryClient.invalidateQueries({
        queryKey: ["gantt-workspace-detail", workspaceId],
      });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message || "Failed to remove dependency");
    },
  });
}
