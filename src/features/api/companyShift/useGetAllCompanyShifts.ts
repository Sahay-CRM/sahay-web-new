import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetAllCompanyShifts(enable = true) {
  return useQuery({
    queryKey: ["get-all-company-shifts"],
    queryFn: async () => {
      const { data } = await Api.post<{ data: CompanyShift[] }>({
        url: Urls.getAllCompanyShifts(),
        data: {},
      });
      return data;
    },
    enabled: enable,
  });
}
