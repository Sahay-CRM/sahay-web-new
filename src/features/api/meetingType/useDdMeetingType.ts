import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useDdMeetingType(props?: FilterDataProps) {
  const filter = props?.filter || {};
  const query = useQuery({
    queryKey: ["get-dd-meeting-type-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<{
        data: CompanyMeetingTypeDataProps[];
      }>({
        url: Urls.ddMeetingType(),
        data: filter,
      });

      return resData;
    },
    enabled: props?.enable !== undefined ? !!props.enable : true,
  });
  return query;
}
