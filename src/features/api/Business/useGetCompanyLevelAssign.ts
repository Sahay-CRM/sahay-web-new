import { getUserDetail } from "@/features/selectors/auth.selector";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

export default function useGetCompanyLevelAssign() {
  const company = useSelector(getUserDetail);
  const companyId = company.companyId ?? "";

  const query = useQuery({
    queryKey: ["get-CompanyLevelAssign"],
    queryFn: async () => {
      const { data: resData } = await Api.post<{
        data: CompanyLevelJunction[];
      }>({
        url: Urls.getAllCompanyLevel(companyId),
      });
      return resData;
    },
    enabled: !!companyId,
  });
  return query;
}
