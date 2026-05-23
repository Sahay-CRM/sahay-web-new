import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface CreateTemplatePayload {
  templateName: string;
  templateDescription?: string;
  ownerType: "SYSTEM" | "COMPANY";
  industryId?: string | null;
}

export function useCreateGanttTemplate() {
  return useMutation({
    mutationFn: async (payload: CreateTemplatePayload) => {
      const { data } = await Api.post<{
        data: { ganttTemplateId: string };
        message: string;
      }>({
        url: Urls.ganttTemplateCreate(),
        data: payload,
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Template created");
      queryClient.invalidateQueries({ queryKey: ["gantt-templates"] });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message || "Failed to create template");
    },
  });
}

export function useUpdateGanttTemplate(id: string) {
  return useMutation({
    mutationFn: async (
      payload: Partial<CreateTemplatePayload> & { isActive?: boolean },
    ) => {
      const { data } = await Api.put<{ data: unknown; message: string }>({
        url: Urls.ganttTemplateUpdate(id),
        data: payload,
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Template updated");
      queryClient.invalidateQueries({ queryKey: ["gantt-templates"] });
      queryClient.invalidateQueries({
        queryKey: ["gantt-template-detail", id],
      });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message || "Failed to update template");
    },
  });
}

export function useDeleteGanttTemplate() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await Api.delete<{ message: string }>({
        url: Urls.ganttTemplateDelete(id),
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Template deleted");
      queryClient.invalidateQueries({ queryKey: ["gantt-templates"] });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message || "Failed to delete template");
    },
  });
}

export function usePublishGanttTemplate() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await Api.post<{
        data: {
          ganttTemplateId: string;
          version: number;
          isPublished: boolean;
        };
        message: string;
      }>({
        url: Urls.ganttTemplatePublish(id),
        data: {},
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Template published");
      queryClient.invalidateQueries({ queryKey: ["gantt-templates"] });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message || "Failed to publish template");
    },
  });
}

export function useDuplicateGanttTemplate() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await Api.post<{
        data: { ganttTemplateId: string };
        message: string;
      }>({
        url: Urls.ganttTemplateDuplicate(id),
        data: {},
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Template duplicated");
      queryClient.invalidateQueries({ queryKey: ["gantt-templates"] });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(
        err.response?.data?.message || "Failed to duplicate template",
      );
    },
  });
}
