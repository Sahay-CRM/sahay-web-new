import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Form as UIForm } from "@/components/ui/form";
import type {
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
  UseFormReturn,
} from "react-hook-form";

interface FormLoginStepProps {
  otpFormMethods: UseFormReturn<FormAccessData>;
  register: UseFormRegister<FormAccessData>;
  handleOtpSubmit: (
    handler: (data: FormAccessData) => void,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  setValue: UseFormSetValue<FormAccessData>;
  errors: FieldErrors<FormAccessData>;
  onOtpSubmit: (data: FormAccessData) => Promise<void>;
  statusSentOtp: boolean;
  isSendingOtp: boolean;
  isVerifyingOtp: boolean;
  formName: string;
}

const FormLoginStep = ({
  otpFormMethods,
  register,
  handleOtpSubmit,
  setValue,
  errors,
  onOtpSubmit,
  statusSentOtp,
  isSendingOtp,
  isVerifyingOtp,
  formName,
}: FormLoginStepProps) => {
  return (
    <div className="min-h-screen bg-[#f8f8fb] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 break-words">
              Access {formName}
            </h1>
            <p className="text-gray-500 text-sm">
              Enter your details to begin.
            </p>
          </div>

          <div className="w-full">
            <UIForm {...otpFormMethods}>
              <form
                onSubmit={handleOtpSubmit(onOtpSubmit)}
                className="space-y-5"
              >
                <div className="space-y-4">
                  {/* Name Field */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                      Your Name
                    </label>
                    <input
                      placeholder="Enter your full name"
                      disabled={statusSentOtp}
                      className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:border-[#2f328e] outline-none disabled:opacity-60"
                      {...register("name", {
                        required: "Please enter your name",
                      })}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-[10px] mt-1 px-1">
                        {errors.name.message as string}
                      </p>
                    )}
                  </div>

                  {/* Mobile Field */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <div className="h-12 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm text-gray-500 font-medium whitespace-nowrap shrink-0">
                        +91
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="Enter number"
                        disabled={statusSentOtp}
                        className="flex-1 min-w-0 h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:border-[#2f328e] outline-none disabled:opacity-60"
                        {...register("mobile", {
                          required: "Enter mobile number",
                          pattern: {
                            value: /^[6-9][0-9]{9}$/,
                            message: "Enter valid 10-digit number",
                          },
                        })}
                      />
                    </div>
                    {errors.mobile && (
                      <p className="text-red-500 text-[10px] mt-1 px-1">
                        {errors.mobile.message as string}
                      </p>
                    )}
                  </div>

                  {/* OTP Field */}
                  {statusSentOtp && (
                    <div className="space-y-3 pt-2">
                      <div className="w-full items-center">
                        <InputOTP
                          maxLength={4}
                          pattern="^[0-9]+$"
                          onChange={(val) =>
                            setValue("otp", val, { shouldValidate: true })
                          }
                          className="w-full"
                        >
                          <InputOTPGroup className="flex items-center justify-between w-full gap-3 mt-2">
                            {[0, 1, 2, 3].map((i) => (
                              <InputOTPSlot
                                key={i}
                                index={i}
                                className="flex-1 h-12 text-xl text-center border border-gray-200 rounded-md focus:border-[#2f328e] outline-none bg-gray-50 !transition-none"
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>

                      <input
                        type="hidden"
                        {...register("otp", { required: "Enter OTP" })}
                      />
                      {errors.otp && (
                        <p className="text-red-500 text-[10px] text-center">
                          {errors.otp.message as string}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-sm font-bold bg-[#2f328e] hover:bg-[#1e205e] text-white rounded-xl shadow-lg shadow-[#2f328e]/10 flex items-center justify-center gap-2"
                  disabled={
                    (!statusSentOtp && isSendingOtp) ||
                    (statusSentOtp && isVerifyingOtp)
                  }
                >
                  {((!statusSentOtp && isSendingOtp) ||
                    (statusSentOtp && isVerifyingOtp)) && (
                    <Loader2 className="animate-spin h-4 w-4" />
                  )}
                  {statusSentOtp ? "Verify & Enter" : "Send OTP"}
                </Button>
              </form>
            </UIForm>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormLoginStep;
