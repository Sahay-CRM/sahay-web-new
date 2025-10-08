import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { AxiosError } from "axios";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";

interface GroupSequenceProps {
  groupSequenceArray: string[];
}

export default function useUpdateGroupSequence() {
  const groupSequenceMutation = useMutation({
    mutationKey: ["group-sequence-mutation"],
    mutationFn: async (sequenceData: GroupSequenceProps) => {
      const { data: resData } = await Api.post({
        url: Urls.updateGroupSequence(),
        data: sequenceData,
      });
      return resData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-project-list-meeting"],
      });

      queryClient.invalidateQueries({
        queryKey: ["get-project-list"],
      });

      toast.success("Group sequence updated successfully!");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        `Error updating group sequence: ${error.response?.data?.message}`,
      );
    },
  });

  return groupSequenceMutation;
}
