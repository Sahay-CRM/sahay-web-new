import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function useAddCountry() {
  const addCountryMutation = useMutation({
    mutationKey: ["add-country"],
    mutationFn: async (data: CountryData) => {
      const isUpdate = !!data.countryId;

      const payload = {
        countryName: data.countryName,
      };

      const config = {
        url: isUpdate ? Urls.updateCountry(data.countryId) : Urls.addCountry(),
        data: payload,
      };

      const { data: resData } = isUpdate
        ? await Api.put<CountryResponse>(config)
        : await Api.post<CountryResponse>(config);

      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["get-country-list"] });
    },
  });

  return addCountryMutation;
}
