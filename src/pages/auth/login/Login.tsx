import React, { useCallback, useMemo } from "react";
import useLogin from "./useLogin";
import logoImg from "@/assets/logo_1.png";
import FormSelect from "@/components/shared/FormSelect/FormSelect";
import FormInputField from "@/components/shared/FormInput/FormInputField";
import { Button } from "@/components/ui/button";
// import { InputOTP } from "@/components/ui/input-otp";
import { Form } from "@/components/ui/form";
import { Controller, useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";

const Login: React.FC = () => {
  const {
    register,
    handleFormSubmit,
    // statusSentOtp,
    errors,
    // loading,
    // trigger,
    // setValue,
    control,
    // companies,
    // isCompanyModalOpen,
    // handleLogin,
    countryCode,
    setCountryCode,
    // setCompanyModalOpen,
    // handleSubmit,
  } = useLogin();

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleFormSubmit();
    },
    [handleFormSubmit],
  );

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
        onSubmit={onSubmit}
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
              {/* 
              {statusSentOtp && (
                <> */}
              {/* <InputOTP
                length={4}
                name="otp"
                register={register}
                setValue={setValue}
                trigger={trigger}
                validation={{
                  minLength: {
                    value: 4,
                    message: "OTP must be 4 digits",
                  },
                }}
                onComplete={handleFormSubmit}
                errors={errors}
              /> */}
              {/* {errors.otp && (
                  <p className="text-red-500 mt-1">{errors.otp.message}</p>
                )} */}
              {/* </>
              )} */}

              <Button
                onClick={onSubmit}
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
