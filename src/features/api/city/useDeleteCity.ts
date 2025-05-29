import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useDeleteCity() {
  const deleteCityMutation = useMutation({
    mutationKey: ["delete-city"],
    mutationFn: async (data: CityData) => {
      const { data: resData } = await Api.delete<{ message: string }>({
        url: Urls.deleteCity(data.cityId),
      });
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

  return deleteCityMutation;
}
