import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface ForeTokenProps {
  employeeId: string;
  webToken: string | null;
}

export default function useUpdateFireToken() {
  const fireTokenMutation = useMutation({
    mutationKey: ["add-update-brand"],
    mutationFn: async (data: ForeTokenProps) => {
      const { data: resData } = await Api.post({
        url: Urls.updateFireToken(),
        data: data,
      });
      return resData;
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return fireTokenMutation;
}
