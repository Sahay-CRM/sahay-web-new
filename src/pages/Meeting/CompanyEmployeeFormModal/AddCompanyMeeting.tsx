import { Controller, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import StepProgress from "@/components/shared/StepFom/StepForm";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { Card } from "@/components/ui/card";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";
import { useAddCompanyEmployee } from "./useAddCompanyMeeting";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";

interface AddAdminMeetingProps {
  isEditMode?: boolean;
}

export default function AddMeeting({
  isEditMode = false,
}: AddAdminMeetingProps) {
  const { id } = useParams();
  // const isEditMode = !!id;

  const {
    step,
    nextStep,
    prevStep,
    onSubmit,
    steps,
    methods,
    departmentData,
    designationData,
    employees,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, id]);

  return (
    <FormProvider {...methods}>
      <div className="w-full mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">
          {isEditMode ? "Update Meeting" : "Add New Meeting"}
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
                label="Meeting Name"
                {...register("name", { required: "Name is required" })}
                error={errors.name}
              />

              <FormInputField
                label="Meeting Description"
                {...register("description", {
                  required: "Description is required",
                })}
                error={errors.description}
              />

              <Controller
                control={methods.control}
                name="meetingDateTime"
                rules={{ required: "Meeting date & time is required" }}
                render={({ field }) => (
                  <FormDateTimePicker
                    label="Meeting Date & Time"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.meetingDateTime}
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
              rules={{ required: "Meeting status is required" }}
              render={({ field }) => (
                <FormSelect
                  label="Meeting Status"
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
              rules={{ required: "Meeting Type is required" }}
              render={({ field }) => (
                <FormSelect
                  label="Meeting Type"
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
                rules={{ required: "Joiners required" }}
                render={({ field }) => (
                  <FormSelect
                    label="Joiners"
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
