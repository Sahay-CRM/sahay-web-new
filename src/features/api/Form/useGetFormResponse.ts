import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export interface Submission {
  id: string;
  formId: string;
  mobileNumber: string;
  scoreString?: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  status: string;
  score: {
    scoreString: string;
    totalMcqFields: number;
    correctFields: number;
  };
  formResponses: FormResponseItem[];
}

export interface FormResponseItem {
  id: string;
  value: string;
  fileUrl: string | null;
  formFieldId?: string;
  field?: {
    id: string;
    label: string;
    fieldType: string;
    order: number;
  };
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

export default function useGetFormResponse({
  filter,
  enable,
}: FilterDataProps) {
  return useQuery({
    queryKey: ["get-form-response", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<FormResponseData>({
        url: Urls.getFormResponse(filter.id),
        data: {
          ...filter,
        },
      });
      return resData;
    },
    enabled: enable,
  });
}
