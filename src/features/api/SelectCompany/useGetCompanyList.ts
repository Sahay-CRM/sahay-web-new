import { getUserDetail } from "@/features/selectors/auth.selector";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

export default function useGetCompanyList() {
  const user = useSelector(getUserDetail);

  const query = useQuery({
    queryKey: ["get-company-list"],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: Company[] }>({
        url: Urls.selectCompanyList(),
        data: {
          userMobileNumber: user?.mobile,
        },
      });
      return resData.data;
    },
  });
  return query;
}
