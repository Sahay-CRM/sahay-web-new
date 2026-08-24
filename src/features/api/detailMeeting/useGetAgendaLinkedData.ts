import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export interface LinkedItemDetails {
  count: number;
  names: string[];
}

export interface AgendaLinkedData {
  id: string;
  type: "ISSUE" | "OBJECTIVE";
  name: string;
  meetings: LinkedItemDetails;
  tasks: LinkedItemDetails;
  projects: LinkedItemDetails;
  kpis: LinkedItemDetails;
  totalLinkedCount: number;
}

export interface AgendaLinkedDataResponse {
  success: boolean;
  status: number;
  message: string;
  data: AgendaLinkedData;
}

export default function useGetAgendaLinkedData({
  agendaId,
  ioType,
  enable = false,
}: {
  agendaId: string;
  ioType: "ISSUE" | "OBJECTIVE" | "";
  enable?: boolean;
}) {
  return useQuery({
    queryKey: ["get-agenda-linked-data", agendaId, ioType],
    queryFn: async () => {
      // Build dynamic request payload based on the agenda type
      const payload: Record<string, string> = {
        ioType,
      };

      if (ioType === "ISSUE") {
        payload.issueId = agendaId;
      } else if (ioType === "OBJECTIVE") {
        payload.objectiveId = agendaId;
      }

      const { data: resData } = await Api.post<AgendaLinkedDataResponse>({
        url: Urls.fetchLinkedData(),
        data: payload,
      });
      return resData.data;
    },
    enabled: !!enable && !!agendaId && !!ioType,
  });
}
