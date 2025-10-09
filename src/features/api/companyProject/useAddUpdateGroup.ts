import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type GroupRes = CommonResponse<GroupData>;

export default function useAddUpdateGroup() {
  const groupMutation = useMutation({
    mutationKey: ["add-update-group"],
    mutationFn: async (data: GroupInput) => {
      const isUpdate = Boolean(data.groupId);

      const config = {
        url: isUpdate ? Urls.updateGroup(data.groupId!) : Urls.addGroup(),
        data: data,
      };
      const { data: resData } = isUpdate
        ? await Api.post<GroupRes>(config)
        : await Api.post<GroupRes>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-group-list"] });
      queryClient.resetQueries({ queryKey: ["get-meeting-notes"] });
      queryClient.resetQueries({ queryKey: ["get-group-dropdown"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return groupMutation;
}
