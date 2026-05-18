import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function useGetTeamPositions(teamId?: string, enable?: boolean) {
  return useQuery({
    queryKey: ["get-team-positions", teamId],
    queryFn: async () => {
      const { data } = await Api.get<TeamPositionsResponse>({
        url: Urls.teamPositionByTeamId(),
      });
      return data;
    },

    enabled: enable !== false,
  });
}

export function useAddUpdateTeamPosition() {
  return useMutation({
    mutationKey: ["add-update-team-position"],
    mutationFn: async (data: {
      teamPositionId?: string;
      employeeId: string;
      teamId?: string;
      parentPositionId?: string | null;
      seatTitle?: string;
      isDeptHead?: boolean;
      isManager?: boolean;
    }) => {
      const isUpdate = Boolean(data.teamPositionId);
      const { ...sendData } = data;
      const config = {
        url: isUpdate
          ? Urls.teamPositionUpdate(data.teamPositionId!)
          : Urls.teamPositionCreate(),
        data: sendData,
      };
      const { data: resData } = isUpdate
        ? await Api.put<TeamPositionResponse>(config)
        : await Api.post<TeamPositionResponse>(config);

      return resData;
    },

    onSuccess: (res) => {
      toast.success(res.message || "Position updated successfully");
      queryClient.invalidateQueries({ queryKey: ["get-team-positions"] });

      queryClient.invalidateQueries({
        queryKey: ["get-employee-list-dd"],
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update position");
    },
  });
}

export function useDeleteTeamPosition() {
  return useMutation({
    mutationKey: ["delete-team-position"],
    mutationFn: async (id: string) => {
      const { data } = await Api.delete<DeleteRes>({
        url: Urls.teamPositionDelete(id),
      });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Position deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["get-team-positions"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete position");
    },
  });
}
