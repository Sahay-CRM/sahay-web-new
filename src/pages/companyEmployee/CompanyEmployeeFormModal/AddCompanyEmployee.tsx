import { Controller, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import StepProgress from "@/components/shared/StepFom/StepForm";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { Card } from "@/components/ui/card";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";
import { useAddCompanyEmployee } from "./useAddCompanyEmployee";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

interface AddAdminUserProps {
  isEditMode?: boolean;
}

export default function AddAdminUser({
  isEditMode = false,
}: AddAdminUserProps) {
  const { id } = useParams();
  // const isEditMode = !!id;

  const {
    step,
    nextStep,
    prevStep,
    onSubmit,
    steps,
    methods,
    userTypeOptions,
    departmentData,
    designationData,
    employees,
    countryCode,
    setCountryCode,
    fetchEmployeeById,
  } = useAddCompanyEmployee();

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = methods;

  useEffect(() => {
    if (isEditMode && id) {
      fetchEmployeeById(id).then((data) => {
        reset(data);
        setCountryCode(data.countryCode ?? "+91");
      });
    }
  }, [isEditMode, id, fetchEmployeeById, reset, setCountryCode]);

  return (
    <FormProvider {...methods}>
      <div className="w-full mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">
          {isEditMode ? "Update Employee" : "Add New Employee"}
        </h2>

        <StepProgress currentStep={step} totalSteps={2} stepNames={steps} />

        <div className="flex items-end justify-end gap-2 mt-2 mb-4">
          {step > 1 && <Button onClick={prevStep}>Back</Button>}
          {step < 2 ? (
            <Button onClick={nextStep}>Next</Button>
          ) : (
            <Button onClick={handleSubmit((data) => onSubmit(data, id))}>
              {isEditMode ? "Update" : "Submit"}
            </Button>
          )}
        </div>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="col-span-2 px-4 py-4 grid grid-cols-2 gap-4">
              <FormInputField
                label="Employee Name"
                {...register("name", { required: "Name is required" })}
                error={errors.name}
              />
              <FormInputField
                label="Email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter valid email",
                  },
                })}
                error={errors.email}
              />
              <FormInputField
                id="mobile"
                label="Mobile Number"
                {...register("mobile", {
                  required: "Please enter your mobile number",
                })}
                error={errors.mobile}
                placeholder="Enter mobile number"
                options={[{ value: "+91", label: "+91" }]}
                selectedCodeValue={countryCode || "+91"}
                onCountryCodeChange={setCountryCode}
                className="text-lg"
              />
              <Controller
                control={methods.control}
                name="userType"
                rules={{ required: "Employee Type is required" }}
                render={({ field }) => (
                  <FormSelect
                    label="Employee Type"
                    value={field.value}
                    onChange={field.onChange}
                    options={userTypeOptions}
                    error={errors.userType}
                  />
                )}
              />
            </Card>
          </div>
        )}

        {step === 2 && (
          <Card className="px-4 py-4 grid grid-cols-2 gap-4">
            <Controller
              control={methods.control}
              name="departmentId"
              rules={{ required: "Department is required" }}
              render={({ field }) => (
                <FormSelect
                  label="Department"
                  value={field.value}
                  onChange={field.onChange}
                  options={departmentData}
                  error={errors.departmentId}
                />
              )}
            />

            <Controller
              control={methods.control}
              name="designationId"
              rules={{ required: "Designation is required" }}
              render={({ field }) => (
                <FormSelect
                  label="Designation"
                  value={field.value}
                  onChange={field.onChange}
                  options={designationData}
                  error={errors.designationId}
                />
              )}
            />

            {employees?.length > 0 && (
              <Controller
                control={methods.control}
                name="reportingManagerId"
                rules={{ required: "Reporting Manager required" }}
                render={({ field }) => (
                  <FormSelect
                    label="Reporting Manager"
                    value={field.value}
                    onChange={field.onChange}
                    options={employees}
                    error={errors.reportingManagerId}
                  />
                )}
              />
            )}
          </Card>
        )}
      </div>
    </FormProvider>
  );
}
