import { useParams } from "react-router-dom";
import { Controller, FormProvider } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StepProgress from "@/components/shared/StepFom/StepForm";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import { useAddCompanyEmployee } from "./useAddCompanyTaskList";

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
    taskTypeOptions,
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
          {isEditMode ? "Update Add Company Task" : "Add Add Company Task"}
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
                label="Project"
                {...register("project", { required: "Project is required" })}
                error={errors.project}
              />

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

              <Controller
                control={control}
                name="taskStartDate"
                render={({ field }) => (
                  <FormDateTimePicker
                    label="Task Start Date"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.taskStartDate}
                  />
                )}
              />

              <Controller
                control={control}
                name="taskDeadline"
                rules={{ required: "Task Deadline is required" }}
                render={({ field }) => (
                  <FormDateTimePicker
                    label="Task Deadline"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.taskDeadline}
                  />
                )}
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

            <Controller
              control={control}
              name="taskTypeId"
              rules={{ required: "Task Type is required" }}
              render={({ field }) => (
                <FormSelect
                  label="Task Type"
                  value={field.value}
                  onChange={field.onChange}
                  options={taskTypeOptions}
                  error={errors.taskTypeId}
                />
              )}
            />

            <FormInputField
              label="Meeting"
              {...register("meeting")}
              error={errors.meeting}
            />

            <Controller
              control={control}
              name="assignees"
              rules={{ required: "Assigned User is required" }}
              render={({ field }) => (
                <FormSelect
                  label="Assigned User"
                  value={field.value}
                  onChange={field.onChange}
                  options={employees}
                  error={errors.assignees}
                  isMulti
                />
              )}
            />

            <FormInputField
              label="Comment"
              {...register("comment")}
              error={errors.comment}
            />
          </Card>
        )}
      </div>
    </FormProvider>
  );
}
