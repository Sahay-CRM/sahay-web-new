import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
// interface MeetingProjectRes {
//   detailMeetingProjectId: string;
//   detailMeetingId: string;
//   projectId: string;
// }
type DatePaging = BaseResponse<CompanyProjectDataProps>;

export default function useGetMeetingProject({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-meeting-Project-res", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<DatePaging>({
        url: Urls.getMeetingProjectData(),
        data: {
          ...filter,
        },
      });

      return resData.data;
    },
    enabled: !!enable,
  });
  return query;
}
