import { FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import StepProgress from "@/components/shared/StepFom/StepForm";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormImage from "@/components/shared/Form/FormImage/FormImage";
import { Card } from "@/components/ui/card";
import { useAddAdminUser } from "./useAdminUser";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";

export default function AddAdminUser() {
  const {
    step,
    nextStep,
    prevStep,
    onSubmit,
    steps,
    methods,
    userTypeOptions,
  } = useAddAdminUser();
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = methods;

  return (
    <FormProvider {...methods}>
      <div className="w-full mx-auto p-4">
        <StepProgress currentStep={step} totalSteps={3} stepNames={steps} />
        <div className="flex items-end justify-end gap-2 mt-2 mb-4">
          {step > 1 && <Button onClick={prevStep}>Back</Button>}
          {step < 3 ? (
            <Button onClick={nextStep}>Next</Button>
          ) : (
            <Button onClick={methods.handleSubmit(onSubmit)}>Submit</Button>
          )}
        </div>

        {step === 1 && (
          <div className="flex gap-6">
            <Card className="flex items-start w-1/3 px-4 py-4">
              <FormImage
                value={watch("profilePic")}
                onChange={(val) => setValue("profilePic", val)}
                label="Upload Profile"
              />
            </Card>

            <Card className="w-2/3 px-4 py-4">
              <FormInputField
                label="Full Name"
                {...register("name", { required: "Name is required" })}
                error={errors.name}
              />
              <FormInputField
                label="Mobile Number"
                {...register("mobile", { required: "Mobile is required" })}
                error={errors.mobile}
              />
              <FormInputField
                label="Email"
                {...register("email", { required: "Email is required" })}
                error={errors.email}
              />
              {userTypeOptions && (
                <FormSelect
                  label="User Type"
                  id={`select`}
                  options={userTypeOptions}
                  placeholder="Selete User Type"
                />
              )}
            </Card>
          </div>
        )}

        {step === 2 && (
          <Card className="px-4 py-4 grid grid-cols-2 gap-4">
            <FormInputField
              label="Emergency Contact Name"
              {...register("emergencyName", { required: "Name is required" })}
              error={errors.emergencyName}
            />
            <FormInputField
              label="Emergency Contact Phone"
              {...register("emergencyPhone", { required: "Phone is required" })}
              error={errors.emergencyPhone}
            />
            <FormInputField
              label="Relationship"
              {...register("relationship", {
                required: "Relationship is required",
              })}
              error={errors.relationship}
            />
          </Card>
        )}

        {step === 3 && (
          <Card className="px-4 py-4">
            <div className="flex gap-6">
              <div className="w-1/2 h-64">
                <FormImage
                  value={watch("pan")}
                  onChange={(val) => setValue("pan", val)}
                  label="Upload PAN Card"
                  error={errors.pan}
                />
              </div>
              <div className="w-1/2 h-64">
                <FormImage
                  value={watch("aadhaar")}
                  onChange={(val) => setValue("aadhaar", val)}
                  label="Upload Aadhaar Card"
                  error={errors.aadhaar}
                />
              </div>
            </div>
          </Card>
        )}
      </div>
    </FormProvider>
  );
}
