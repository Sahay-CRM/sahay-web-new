import { useParams } from "react-router-dom";
import { Controller, FormProvider } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StepProgress from "@/components/shared/StepFom/StepForm";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import { useAddCompanyEmployee } from "./useAddCompanyProjectList";

interface AddAdminMeetingProps {
  isEditMode?: boolean;
}

export default function AddMeeting({
  isEditMode = false,
}: AddAdminMeetingProps) {
  const { id } = useParams();

  const {
    step,
    nextStep,
    prevStep,
    onSubmit,
    steps,
    methods,
    employees,
    statusOptions,
    subParameter,
    coreParameter,
  } = useAddCompanyEmployee();

  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
  } = methods;

  return (
    <FormProvider {...methods}>
      <div className="w-full mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">
          {isEditMode ? "Update Company Project" : "Add Company Project"}
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

        {/* Step 1 - Basic Info */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="col-span-2 px-4 py-4 grid grid-cols-2 gap-4">
              <FormInputField
                label="Project Name"
                {...register("projectName", {
                  required: "Project Name is required",
                })}
                error={errors.projectName}
              />

              <FormInputField
                label="Project Description"
                {...register("projectDescription", {
                  required: "Project Description is required",
                })}
                error={errors.projectDescription}
              />

              <Controller
                control={control}
                name="projectDeadline"
                rules={{ required: "Project Deadline is required" }}
                render={({ field }) => (
                  <FormDateTimePicker
                    label="Project Deadline"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.projectDeadline}
                  />
                )}
              />

              {/* Existing task-related fields (optional to keep or remove) */}
              <FormInputField
                label="Task Name"
                {...register("taskName", { required: "Task Name is required" })}
                error={errors.taskName}
              />

              <FormInputField
                label="Task Description"
                {...register("taskDescription", {
                  required: "Task Description is required",
                })}
                error={errors.taskDescription}
              />
            </Card>
          </div>
        )}

        {/* Step 2 - Details & Assignment */}
        {step === 2 && (
          <Card className="px-4 py-4 grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="taskStatusId"
              rules={{ required: "Status is required" }}
              render={({ field }) => (
                <FormSelect
                  label="Status"
                  value={field.value}
                  onChange={field.onChange}
                  options={statusOptions}
                  error={errors.taskStatusId}
                />
              )}
            />

            {/* Core Parameter */}
            <Controller
              control={control}
              name="coreParameter"
              rules={{ required: "coreParameter is required" }}
              render={({ field }) => (
                <FormSelect
                  label="coreParameter"
                  value={field.value}
                  onChange={field.onChange}
                  options={coreParameter}
                  error={errors.coreParameter}
                />
              )}
            />

            <Controller
              control={control}
              name="subParameter"
              rules={{ required: "subParameter is required" }}
              render={({ field }) => (
                <FormSelect
                  label="subParameter"
                  value={field.value}
                  onChange={field.onChange}
                  options={subParameter}
                  error={errors.subParameter}
                  isMulti
                />
              )}
            />

            {/* Employee (single or multi-select depending on logic) */}
            <Controller
              control={control}
              name="employeeId"
              rules={{ required: "Employee is required" }}
              render={({ field }) => (
                <FormSelect
                  label="Employee"
                  value={field.value}
                  onChange={field.onChange}
                  options={employees}
                  error={errors.employeeId}
                  isMulti
                />
              )}
            />
          </Card>
        )}
      </div>
    </FormProvider>
  );
}
