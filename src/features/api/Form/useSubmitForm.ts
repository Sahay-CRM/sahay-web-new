import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type SubmitFormPayload = {
  formId: string;
  mobileNumber: string;
  name: string;
  responses: { fieldId: string; value: string | string[] }[];
  token?: string;
  errorCode?: string;
  errorMessage?: string;
};

export default function useSubmitForm() {
  const submitFormMutation = useMutation({
    mutationKey: ["submit-form"],
    mutationFn: async (data: SubmitFormPayload) => {
      const response = await fetch(Urls.formSubmissionSubmit(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(data.token && { Authorization: `Bearer ${data.token}` }),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to submit form");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Form submitted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit form");
    },
  });
  return submitFormMutation;
}
