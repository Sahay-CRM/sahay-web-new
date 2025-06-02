import React from "react";
import useLogin from "./useLogin";
import logoImg from "@/assets/logo_1.png";
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
  } = useLogin();

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
            <div className="flex justify-center py-4">
              <img src={logoImg} alt="logo" className="w-[60%]" />
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
                className="text-lg"
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

              <Button type="submit" className="w-full text-base py-2.5 mt-2">
                {statusSentOtp ? "Login" : "Send OTP"}
              </Button>
            </div>
          </div>
        </div>

        {/* Company Selection Modal */}
        <CompanyModal
          companies={companies?.map((c) => ({
            companyId: c?.companyId,
            companyAdminName: c?.companyAdminName || "",
          }))}
          isModalOpen={isCompanyModalOpen}
          onSelect={(company) => {
            if (loginDetails) {
              handleLogin({ ...company, ...loginDetails });
            }
          }}
          modalClose={() => setCompanyModalOpen(false)}
        />
      </form>
    </Form>
  );
};

export default React.memo(Login);
