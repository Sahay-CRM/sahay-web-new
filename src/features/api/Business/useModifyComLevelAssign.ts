import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../../queryClient";
import { AxiosError } from "axios";
import Urls from "@/features/utils/urls.utils";
import Api from "@/features/utils/api.utils";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { getUserDetail } from "@/features/selectors/auth.selector";

export default function useModifyComLevelAssign() {
  const company = useSelector(getUserDetail);
  const companyId = company.companyId ?? "";

  const levelAssignMutation = useMutation({
    mutationKey: ["levelAssign-mutation"],
    mutationFn: async (levelData: CompanyLevelJunction[]) => {
      const { data: resData } = await Api.put({
        url: Urls.updateComLevelsAssign(companyId),
        data: levelData,
      });

      return resData;
    },
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["get-core-parameter-dropdown"] });
      queryClient.resetQueries({ queryKey: ["get-CompanyLevelAssign"] });
      queryClient.resetQueries({ queryKey: ["get-levels-assign"] });
      queryClient.resetQueries({
        queryKey: ["get-healthScore-list"],
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });

  return levelAssignMutation;
}
