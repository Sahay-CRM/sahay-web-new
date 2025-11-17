import { getUserDetail } from "@/features/selectors/auth.selector";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

export default function useGetCompanyId() {
  const companyId = useSelector(getUserDetail);

  const query = useQuery({
    queryKey: ["companyDataGetById", companyId],
    queryFn: async () => {
      if (!companyId) throw new Error("Missing Company ID");
      const { data: resData } = await Api.post<{ data: SimpleCompanyDetails }>({
        url: Urls.getCompanyDataById(companyId.companyId!),
      });

      return resData.data;
    },
    enabled: !!companyId,
  });
  return query;
}
