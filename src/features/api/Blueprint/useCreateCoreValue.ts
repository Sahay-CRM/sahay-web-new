/* eslint-disable @typescript-eslint/no-explicit-any */
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function useCreateCoreValue() {
  return useMutation({
    mutationFn: async (variables: { companyId: string; coreValueId: string }) => {
      return Api.post({
        url: Urls.companyCoreValueCreate(),
        data: {
          companyId: variables.companyId,
          coreValueIds: [variables.coreValueId],
          sortOrder: 1
        }
      });
    },
    onSuccess: () => {
      toast.success("Core value added successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to add core value.");
    }
  });
}
