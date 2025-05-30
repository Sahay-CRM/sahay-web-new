import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
type DatePaging = BaseResponse<CompanyMeetingTypeDataProps>;

export default function useGetCompanyMeetingType({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-meeting-type-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getAllMeetingType(),
        data: {
          ...filter,
        },
      });

      return resData;
    },
  });
  return query;
}
