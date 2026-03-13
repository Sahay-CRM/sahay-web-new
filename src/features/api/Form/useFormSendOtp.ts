import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function useFormSendOtp() {
  const sendOtpMutation = useMutation({
    mutationKey: ["form-send-otp"],
    mutationFn: async (data: {
      mobileNumber: string;
      formId: string;
      name: string;
    }) => {
      const response = await fetch(Urls.formSubmissionLogin(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber: data.mobileNumber,
          formId: data.formId,
          name: data.name,
        }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to send OTP");
      }
      return await response.json();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send OTP");
    },
  });
  return sendOtpMutation;
}
