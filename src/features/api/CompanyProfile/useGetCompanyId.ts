import { getUserDetail } from "@/features/selectors/auth.selector";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

export default function useGetCompanyId() {
  const user = useSelector(getUserDetail);
  const companyId = user?.companyId;

  const query = useQuery({
    queryKey: ["companyDataGetById", companyId],
    queryFn: async () => {
      if (!companyId) throw new Error("Missing Company ID");
      const { data: resData } = await Api.post<{ data: SimpleCompanyDetails }>({
        url: Urls.getCompanyDataById(companyId),
      });

      return resData.data;
    },
    enabled: !!companyId,
  });
  return query;
}
