import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
// import { AxiosError } from "axios";

export default function useDeleteCountry() {
  const deleteCountryMutation = useMutation({
    mutationKey: ["delete-country"],
    mutationFn: async (data: CountryData) => {
      const { data: resData } = await Api.delete<CountryResponse>({
        url: Urls.deleteCountry(data?.countryId),
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["get-country-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return deleteCountryMutation;
}
