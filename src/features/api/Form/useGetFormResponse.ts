import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

interface Submission {
  id: string;
  formId: string;
  mobileNumber: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  status: string;
}

interface FormResponseData {
  success: boolean;
  status: number;
  message: string;
  currentPage: number;
  totalCount: number;
  hasMore: boolean;
  pageSize: number;
  totalPage: number;
  data: Submission[];
}

export default function useGetFormResponse(
  formId: string,
  filter?: PaginationFilter,
) {
  return useQuery({
    queryKey: ["get-form-response", formId, filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<FormResponseData>({
        url: Urls.getFormResponse(formId),
        data: filter,
      });
      return resData;
    },
    enabled: !!formId,
  });
}
