import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type EmployeeRes = BaseResponse<FormDetails>;
export default function useGetForms({ filter, enable }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-forms", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<EmployeeRes>({
        url: Urls.getForms(),
        data: filter,
      });
      return resData;
    },
    enabled: !!enable || !!filter,
  });
  return query;
}
