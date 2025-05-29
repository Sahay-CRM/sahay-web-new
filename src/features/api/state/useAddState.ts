import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function useAddState() {
  const addStateMutation = useMutation({
    mutationKey: ["add-state"],
    mutationFn: async (data: StateData) => {
      const isUpdate = !!data.stateId;

      const payload = {
        stateName: data.stateName,
        countryId: data.countryId,
      };

      const config = {
        url: isUpdate ? Urls.updateState(data.stateId) : Urls.addState(),
        data: payload,
      };

      const { data: resData } = isUpdate
        ? await Api.put<CreateStateResponse>(config)
        : await Api.post<CreateStateResponse>(config);

      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["get-state-list"] });
    },
  });

  return addStateMutation;
}
