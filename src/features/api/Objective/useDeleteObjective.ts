import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { AxiosError } from "axios";

type DatePaging = BaseResponse<ObjectiveProps>;

interface ObjDeleteProps {
  objectiveId?: string;
  isForce?: boolean;
}

export default function useDeleteObjective() {
  const deleteObjectiveMutation = useMutation({
    mutationKey: ["delete-company-objective"],
    mutationFn: async (data: ObjDeleteProps) => {
      if (!data.objectiveId) {
        throw new Error("Something Went Wrong");
      }
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.deleteObjective(data.objectiveId),
        data: data,
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["get-objective-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });

  return deleteObjectiveMutation;
}
