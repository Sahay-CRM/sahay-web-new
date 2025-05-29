import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useAddCity() {
  const addCityMutation = useMutation({
    mutationKey: ["add-city"],
    mutationFn: async (data: CityData) => {
      const isUpdate = !!data.cityId;

      const payload = {
        cityName: data.cityName,
        stateId: data.stateId,
      };

      const config = {
        url: isUpdate ? Urls.updateCity(data.cityId) : Urls.addCity(),
        data: payload,
      };

      const { data: resData } = isUpdate
        ? await Api.put<{ message: string }>(config)
        : await Api.post<{ message: string }>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.resetQueries({ queryKey: ["get-city-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });

  return addCityMutation;
}
