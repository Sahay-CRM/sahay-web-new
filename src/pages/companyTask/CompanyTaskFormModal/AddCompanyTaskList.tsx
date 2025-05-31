import { Controller, FormProvider } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StepProgress from "@/components/shared/StepFom/StepForm";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import { useAddCompanyEmployee } from "./useAddCompanyTaskList";
import TableData from "@/components/shared/DataTable/DataTable";

interface AddAdminMeetingProps {
  isEditMode?: boolean;
}

export default function AddMeeting({
  isEditMode = false,
}: AddAdminMeetingProps) {
  const {
    step,
    nextStep,
    prevStep,
    onSubmit,
    steps,
    methods,
    projectListOption,
    repetitionOptions,
    taskStatus,
    taskType,
    setPaginationFilter,
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

        <StepProgress currentStep={step} totalSteps={5} stepNames={steps} />

        <div className="flex items-end justify-end gap-2 mt-2 mb-4">
          {step > 1 && <Button onClick={prevStep}>Back</Button>}
          {step < 5 ? (
            <Button onClick={nextStep}>Next</Button>
          ) : (
            <Button onClick={handleSubmit(onSubmit)}>
              {isEditMode ? "Update" : "Submit"}
            </Button>
          )}
        </div>

        {/* Step 1 - Basic Info */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="col-span-2 px-4 py-4 grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="project"
                rules={{ required: "Project is required" }}
                render={({ field }) => (
                  <FormSelect
                    label="Project"
                    options={projectListOption}
                    placeholder="Select Project"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.project}
                    isMandatory={true}
                  />
                )}
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
            </Card>
          </div>
        )}

        {/* Step 2 - Schedule & Repetition */}
        {step === 2 && (
          <Card className="px-4 py-4 grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="taskStartDate"
              rules={{ required: "Task Start Date is required" }}
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
            <Controller
              control={control}
              name="repetition"
              rules={{ required: "Repetition is required" }}
              render={({ field }) => (
                <FormSelect
                  label="Repetition"
                  options={repetitionOptions}
                  placeholder="Select Repetition"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.repetition}
                />
              )}
            />
          </Card>
        )}

        {/* Step 3 - Task Status */}
        {step === 3 && (
          <Card className="px-4 py-4">
            <Controller
              name="taskStatus"
              control={control}
              rules={{ required: "Please select a Task Status" }}
              render={({ field }) => (
                <TableData
                  {...field}
                  tableData={taskStatus?.data?.map((item, index) => ({
                    ...item,
                    srNo: index + 1,
                  }))}
                  isActionButton={() => false}
                  columns={{
                    taskStatus: "Task Status",
                  }}
                  primaryKey="taskStatusId"
                  multiSelect={false}
                  selectedValue={field.value}
                  handleChange={field.onChange}
                  paginationDetails={taskStatus as PaginationFilter}
                  setPaginationFilter={setPaginationFilter}
                />
              )}
            />
          </Card>
        )}

        {/* Step 4 - Task Type */}
        {step === 4 && (
          <Card className="px-4 py-4">
            <Controller
              name="taskType"
              control={control}
              rules={{ required: "Please select a Task Type" }}
              render={({ field }) => (
                <TableData
                  {...field}
                  tableData={taskType?.data?.map((item, index) => ({
                    ...item,
                    srNo: index + 1,
                  }))}
                  isActionButton={() => false}
                  columns={{
                    taskTypeName: "Task Type",
                  }}
                  primaryKey="taskTypeId"
                  multiSelect={false}
                  selectedValue={field.value}
                  handleChange={field.onChange}
                  paginationDetails={taskType as PaginationFilter}
                  setPaginationFilter={setPaginationFilter}
                />
              )}
            />
          </Card>
        )}

        {/* Step 5 - Comment */}
        {step === 5 && (
          <Card className="px-4 py-4">
            <FormInputField
              label="Comment"
              {...register("comment", { required: "Comment is required" })}
              error={errors.comment}
            />
          </Card>
        )}
      </div>
    </FormProvider>
  );
}
