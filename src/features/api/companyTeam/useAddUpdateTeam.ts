import { getUserDetail } from "@/features/selectors/auth.selector";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export default function useAddUpdateTeam() {
  const data = useSelector(getUserDetail);
  return useMutation({
    mutationKey: ["add-update-team"],
    mutationFn: async (data: Team) => {
      const isUpdate = Boolean(data.teamId);
      const config = {
        url: isUpdate
          ? Urls.teamUpdate(data.teamId as string)
          : Urls.teamCreate(),
        data: data,
      };
      const { data: resData } = isUpdate
        ? await Api.put<CommonResponse<Team>>(config)
        : await Api.post<CommonResponse<Team>>(config);

      return resData;
    },

    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.invalidateQueries({ queryKey: ["get-team-list"] });
      queryClient.invalidateQueries({
        queryKey: ["get-team-by-id", data.companyId],
      });
      queryClient.invalidateQueries({ queryKey: ["get-team-positions"] });
      queryClient.invalidateQueries({
        queryKey: ["get-employees-not-in-team"],
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });
}
