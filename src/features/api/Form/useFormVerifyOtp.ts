import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function useFormVerifyOtp() {
  const verifyOtpMutation = useMutation({
    mutationKey: ["form-verify-otp"],
    mutationFn: async (data: {
      mobileNumber: string;
      otp: string;
      formId: string;
    }) => {
      const response = await fetch(Urls.formSubmissionVerifyOtp(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to verify OTP");
      }
      return await response.json();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to verify OTP");
    },
  });
  return verifyOtpMutation;
}
