import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type GroupRes = CommonResponse<GroupData>;

type AddProjectPayload = {
  groupId: string;
  projectIds: string[];
};

export default function useAddProjectToGroup() {
  const addProjectToGroupMutation = useMutation({
    mutationKey: ["add-project-to-group"],
    mutationFn: async (data: AddProjectPayload) => {
      const { data: resData } = await Api.post<GroupRes>({
        url: Urls.addProjectToGroup(),
        data,
      });
      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Projects added to group");
      queryClient.resetQueries({ queryKey: ["get-group-list"] });
      queryClient.resetQueries({ queryKey: ["get-group-by-id"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to add projects");
    },
  });

  return addProjectToGroupMutation;
}
