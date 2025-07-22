import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type EmpRes = CommonResponse<IssuesProps>;

export default function useAddUpdateIssues() {
  const addUpdateIssues = useMutation({
    mutationKey: ["add-or-update-employee"],
    mutationFn: async (data: IssuesProps) => {
      const isUpdate = Boolean(data.issueId);

      const config = {
        url: isUpdate ? Urls.updateIssues(data.issueId!) : Urls.addIssues(),
        data: data,
      };
      const { data: resData } = isUpdate
        ? await Api.put<EmpRes>(config)
        : await Api.post<EmpRes>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-issues-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addUpdateIssues;
}
