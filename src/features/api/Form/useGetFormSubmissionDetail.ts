import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

interface Field {
  label: string;
  fieldType: string;
  name: string;
  order: number;
}

interface FormResponse {
  id: string;
  submissionId: string;
  formFieldId: string;
  value: string;
  fileUrl: string | null;
  createdAt: string;
  field: Field;
}

interface FormError {
  id: string;
  submissionId: string;
  errorCode: string;
  errorMessage: string;
  createdAt: string;
  updatedAt: string;
}

interface FormMedia {
  id: string;
  refId: string;
  fileUrl: string;
  fileType: string;
  mobileNumber: string | null;
  createdAt: string;
}

interface SubmissionDetail {
  id: string;
  formId: string;
  formName: string;
  mobileNumber: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  status: string;
  form: {
    id: string;
    name: string;
    description: string;
  };
  formResponses: FormResponse[];
  formErrors: FormError[];
  formMedia: FormMedia[];
}

interface SubmissionDetailRes {
  success: boolean;
  status: number;
  message: string;
  data: SubmissionDetail;
}

export default function useGetFormSubmissionDetail(submissionId: string) {
  return useQuery({
    queryKey: ["get-form-submission-detail", submissionId],
    queryFn: async () => {
      const { data: resData } = await Api.post<SubmissionDetailRes>({
        url: Urls.getFormSubmissionDetail(submissionId),
      });
      return resData;
    },
    enabled: !!submissionId,
  });
}
