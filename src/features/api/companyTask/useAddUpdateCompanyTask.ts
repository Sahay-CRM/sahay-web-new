import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type DatePaging = BaseResponse<CompanyProjectDataProps>;

export default function useAddUpdateCompanyTask() {
  const addUpdateCompanyTaskMutation = useMutation({
    mutationKey: ["add-or-update-task-list"],
    mutationFn: async (data: CompanyProjectDataProps) => {
      const isUpdate = Boolean(data.projectId);
      const payload = {
        meetingName: data?.meetingName,
        meetingDescription: data?.meetingDescription,
        meetingDateTime: data?.meetingDateTime,
        joiners: data?.joiners,
      };

      const config = {
        url: isUpdate
          ? Urls.updateCompanyProject(data.projectId!)
          : Urls.addCompanyProject(),
        data: payload,
      };

      const { data: resData } = isUpdate
        ? await Api.put<DatePaging>(config)
        : await Api.post<DatePaging>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-task-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addUpdateCompanyTaskMutation;
}
