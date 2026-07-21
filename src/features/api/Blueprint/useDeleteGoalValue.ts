import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";

export default function useDeleteGoalValue() {
  return useMutation({
    mutationFn: async (variables: { ids: string[]; companyId: string }) => {
      return Promise.all(variables.ids.map(id => Api.delete({ url: Urls.companyGoalValueDelete(id) })));
    }
  });
}
