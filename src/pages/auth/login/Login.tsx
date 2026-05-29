import React from "react";
import useLogin from "./useLogin";
import logoImg from "@/assets/Sahay_Logo_only.png";
import background from "@/assets/background.png";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { Button } from "@/components/ui/button";
import { Form, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import CompanyModal from "./CompanyModal";
import { Loader2 } from "lucide-react"; // Add this import for spinner icon
import iphoneQR from "@/assets/iphone.png";
import androidQR from "@/assets/Android.png";

const Login: React.FC = () => {
  const {
    register,
    handleFormSubmit,
    statusSentOtp,
    errors,
    setValue,
    companies,
    isCompanyModalOpen,
    handleLogin,
    countryCode,
    setCountryCode,
    setCompanyModalOpen,
    loginDetails,
    isSendingOtp,
    isVerifyingOtp,
    isCompanyVerifying,
  } = useLogin();

  const iosAppUrl =
    import.meta.env.VITE_IOS_APP_URL ||
    "https://apps.apple.com/in/app/trackbizhealth/id6759311304";
  const androidAppUrl =
    import.meta.env.VITE_ANDROID_APP_URL ||
    "https://play.google.com/store/apps/details?id=com.trackbizhealth.prod";
  const REGEXP_ONLY_DIGITS = "^[0-9]+$";
  const methods = useForm();

  return (
    <Form {...methods}>
      <form
        className="w-full h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden"
        onSubmit={handleFormSubmit}
      >
        {/* Left - Background */}
        <div
          className="flex flex-col justify-between bg-cover bg-center p-6 text-white"
          style={{ backgroundImage: `url(${background})` }}
        >
          <div className="mt-8 ml-15">
            <p className="text-[30px] font-semibold">Smarter workflows.</p>
            <p className="text-[30px] font-semibold">Happier customers.</p>
          </div>
        </div>

        {/* Right - Form */}
        <div className="flex items-center justify-center bg-white">
          <div className="w-full max-w-xl px-8 py-10">
            <div className="flex justify-center py-4 mb-5">
              <img src={logoImg} alt="logo" className="w-[60%] " />
            </div>
            <div className="space-y-6">
              <FormInputField
                id="mobile"
                label="Mobile Number"
                {...register("mobile", {
                  required: "Please enter your mobile number",
                })}
                error={errors.mobile}
                placeholder="Enter mobile number"
                disabled={statusSentOtp}
                options={[{ value: "+91", label: "+91" }]}
                selectedCodeValue={countryCode || "+91"}
                onCountryCodeChange={setCountryCode}
                className="text-lg py-5"
              />

              {statusSentOtp && (
                <div className="space-y-3 text-center w-full">
                  <FormLabel className="text-base font-medium">
                    Enter OTP
                  </FormLabel>
                  <InputOTP
                    maxLength={4}
                    pattern={REGEXP_ONLY_DIGITS}
                    onChange={(val) => {
                      setValue("otp", val, { shouldValidate: true });
                    }}
                    className="w-full"
                  >
                    <InputOTPGroup className="grid grid-cols-4 gap-4 w-full">
                      {[...Array(4)].map((_, i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          autoFocus={i === 0}
                          className="w-full text-xl text-center border border-zinc-700 rounded-md focus:border-black focus:ring-0 outline-none bg-transparent"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>

                  <input
                    type="hidden"
                    {...register("otp", {
                      required: "Please enter OTP",
                      maxLength: {
                        value: 6,
                        message: "OTP must be 6 digits",
                      },
                    })}
                  />
                  {errors.otp && (
                    <span className="text-red-600 text-sm">
                      {errors.otp.message}
                    </span>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full text-base py-5 mt-2 flex items-center justify-center"
                disabled={
                  (!statusSentOtp && isSendingOtp) ||
                  (statusSentOtp && isVerifyingOtp)
                }
              >
                {((!statusSentOtp && isSendingOtp) ||
                  (statusSentOtp && isVerifyingOtp)) && (
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                )}
                {statusSentOtp ? "Login" : "Send OTP"}
              </Button>

              {/* Download Mobile App - Clean Borderless Design */}
              <div className="mt-8 w-full max-w-md mx-auto text-center">
                <div className="flex items-center justify-center gap-2 mb-5">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400/90 uppercase">
                    Scan to Download Mobile App
                  </span>
                </div>

                <div className="flex items-center justify-center gap-14">
                  {/* iOS App */}
                  <div className="flex flex-col items-center gap-2.5 group cursor-pointer">
                    <a
                      href={iosAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:border-indigo-100 block"
                    >
                      <img
                        src={iphoneQR}
                        alt="iOS QR"
                        className="w-18 h-18 object-contain"
                      />
                    </a>
                    <a
                      href={iosAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors flex items-center gap-0.5"
                    >
                      <span>iOS App</span>
                      <span className="opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-[10px]">
                        →
                      </span>
                    </a>
                  </div>

                  {/* Android App */}
                  <div className="flex flex-col items-center gap-2.5 group cursor-pointer">
                    <a
                      href={androidAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:border-emerald-100 block"
                    >
                      <img
                        src={androidQR}
                        alt="Android QR"
                        className="w-18 h-18 object-contain"
                      />
                    </a>
                    <a
                      href={androidAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-500 group-hover:text-emerald-600 transition-colors flex items-center gap-0.5"
                    >
                      <span>Android App</span>
                      <span className="opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-[10px]">
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Selection Modal */}
        {isCompanyModalOpen && (
          <CompanyModal
            companies={companies}
            isModalOpen={isCompanyModalOpen}
            isLoading={isCompanyVerifying}
            onSelect={(company) => {
              if (loginDetails) {
                handleLogin({ ...company, ...loginDetails });
              }
            }}
            modalClose={() => setCompanyModalOpen(false)}
          />
        )}
      </form>
    </Form>
  );
};

export default React.memo(Login);
