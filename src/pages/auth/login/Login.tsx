import React, { useMemo } from "react";
import useLogin from "./useLogin";
import logoImg from "@/assets/logo_1.png";
import FormSelect from "@/components/shared/FormSelect/FormSelect";
import FormInputField from "@/components/shared/FormInput/FormInputField";
import { Button } from "@/components/ui/button";
// import { InputOTP } from "@/components/ui/input-otp";
import { Form } from "@/components/ui/form";
import { Controller, useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

const Login: React.FC = () => {
  const {
    register,
    handleFormSubmit,
    statusSentOtp,
    errors,
    // loading,
    // trigger,
    setValue,
    control,
    // companies,
    // isCompanyModalOpen,
    // handleLogin,
    countryCode,
    setCountryCode,
    // setCompanyModalOpen,
    // handleSubmit,
  } = useLogin();

  const REGEXP_ONLY_DIGITS = "^[0-9]+$";

  // const onSubmit = useCallback(
  //   (e: React.FormEvent) => {
  //     e.preventDefault();
  //     handleFormSubmit();
  //   },
  //   [handleFormSubmit],
  // );

  const loginOptions = useMemo(
    () => [
      { label: "Consultant", value: "CONSULTANT" },
      { label: "Company", value: "COMPANYADMIN" },
      { label: "Employee", value: "EMPLOYEE" },
      { label: "Admin", value: "SUPERADMIN" },
    ],
    [],
  );
  const methods = useForm();
  return (
    <Form {...methods}>
      <form
        className="min-h-screen flex flex-col justify-center items-center p-4"
        onSubmit={handleFormSubmit}
      >
        <Card className={""}>
          <div className="flex p-2 rounded-tr-lg rounded-tl-lg">
            <img src={logoImg} alt="logo" className="w-[50%] m-auto p-4" />
          </div>
          <div className="px-6 relative bg-white">
            <div className="mt-2">
              <div className="mb-4 w-full">
                <Controller
                  name="userType"
                  control={control}
                  rules={{ required: "Please select a role" }}
                  render={({ field }) => (
                    <FormSelect
                      {...field}
                      label="Login as"
                      options={loginOptions}
                      placeholder="Select login type"
                      // disabled={statusSentOtp}
                      error={errors.userType}
                    />
                  )}
                />
              </div>

              <FormInputField
                id="mobile"
                label="Mobile Number"
                {...register("mobile", {
                  required: "Please enter your mobile number",
                })}
                className=""
                error={errors.mobile}
                placeholder="Enter mobile number"
                disabled={false}
                required={true}
                options={[{ value: "+91", label: "+91" }]}
                selectedCodeValue={countryCode ? countryCode : "+91"}
                onCountryCodeChange={setCountryCode}
              />

              {statusSentOtp && (
                <>
                  <div className="space-y-3 text-center w-full">
                    <Label className="text-white text-base font-medium after:content-['_*'] after:text-red-500">
                      Enter Otp
                    </Label>
                    <div className="flex justify-center w-full">
                      <InputOTP
                        maxLength={4}
                        pattern={REGEXP_ONLY_DIGITS}
                        // value={otpValue}
                        onChange={(val) => {
                          // setOtpValue(val);
                          setValue("otp", val, { shouldValidate: true });
                        }}
                        className="text-white bg-transparent w-full max-w-xs"
                      >
                        <InputOTPGroup className="flex justify-center gap-2 sm:gap-3 md:gap-4 w-full">
                          {[...Array(4)].map((_, i) => (
                            <InputOTPSlot
                              key={i}
                              index={i}
                              autoFocus={i === 0}
                              className="w-10 h-12 sm:w-13 sm:h-14 text-center text-lg sm:text-xl bg-black text-white rounded-md border border-zinc-700 focus:border-white focus:ring-2 focus:ring-white outline-none transition-all"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <input
                      type="hidden"
                      {...register("otp", {
                        required: "Please Enter Otp",
                        maxLength: {
                          value: 6,
                          message: "OTP must be 6 digits",
                        },
                      })}
                    />
                    {errors.otp && (
                      <p className="text-sm text-red-500 text-center mt-1">
                        {errors.otp.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              <Button
                onClick={handleFormSubmit}
                // disabled={loading}
                className="w-full mt-4"
              >
                Send OTP
              </Button>
            </div>
          </div>

          {/* <CompanyModal
          companies={companies}
          isOpen={isCompanyModalOpen}
          onSelect={handleLogin}
          onClose={() => {
            setCompanyModalOpen(false);
            setTimeout(() => {
              window.location.reload();
            }, 300);
          }}
        /> */}
        </Card>
      </form>
    </Form>
  );
};

export default React.memo(Login);
