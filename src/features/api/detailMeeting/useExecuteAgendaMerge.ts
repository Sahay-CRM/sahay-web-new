 import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export interface ExecuteAgendaMergePayload {
  sourceAgendaId: string;
  targetAgendaId: string;
}

export default function useExecuteAgendaMerge() {
  const mutation = useMutation({
    mutationKey: ["execute-agenda-merge"],
    mutationFn: async ({ sourceAgendaId, targetAgendaId }: ExecuteAgendaMergePayload) => {
      // POST /company/agenda-merge/merge/:targetAgendaId
      // Request body: { sourceId }
      const { data: resData } = await Api.post<BaseResponse<unknown>>({
        url: Urls.mergeAgenda(targetAgendaId),
        data: {
          sourceId: sourceAgendaId,
        },
      });
      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Agendas merged successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to merge agendas");
    },
  });

  return mutation;
}
