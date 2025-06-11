import { Controller, FormProvider } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StepProgress from "@/components/shared/StepFom/StepForm";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import { useAddCompanyEmployee } from "./useAddCompanyTaskList";
import TableData from "@/components/shared/DataTable/DataTable";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect } from "react";
import { Link } from "react-router-dom";

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
    // projectListOption,
    projectListdata,
    repetitionOptions,
    employeedata,
    setPaginationFilterEmployee,
    setPaginationFilterProject,
    setPaginationFilterMeeting,
    meetingData,
    taskId,
    taskStatusOptions,
    taskTypeOptions,
    permission,
  } = useAddCompanyEmployee();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Task", href: "/dashboard/tasks" },
      {
        label: taskId ? "Update Task" : "Add Task",
        href: "",
      },
    ]);
  }, [setBreadcrumbs, taskId]);

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

        <StepProgress
          currentStep={step}
          totalSteps={steps.length}
          stepNames={steps}
        />

        <div className="flex items-end justify-end gap-2 mt-2 mb-4">
          {step > 1 && <Button onClick={prevStep}>Back</Button>}
          {step < steps.length ? (
            <Button onClick={nextStep}>Next</Button>
          ) : (
            <Button onClick={handleSubmit(onSubmit)}>
              {isEditMode ? "Update" : "Submit"}
            </Button>
          )}
        </div>

        {/* Step 1 - Project Selection */}
        {step === 1 && (
          <Card className="px-4 py-4">
            <div>
              {permission.PROJECT_LIST.Add && (
                <Link to="/dashboard/projects/add?from=task">
                  <Button className="py-2 w-fit">Add Company Project</Button>
                </Link>
              )}
            </div>
            <Controller
              name="project"
              control={control}
              rules={{ required: "Please select a Company Project" }}
              render={({ field }) => (
                <>
                  {errors?.project && (
                    <div className="mt-2">
                      <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                        {String(errors?.project?.message || "")}
                      </span>
                    </div>
                  )}
                  <TableData
                    tableData={projectListdata?.data?.map((item, index) => ({
                      ...item,
                      srNo:
                        (projectListdata.currentPage - 1) *
                          projectListdata.pageSize +
                        index +
                        1,
                    }))}
                    isActionButton={() => false}
                    columns={{
                      projectName: "Project Name",
                    }}
                    primaryKey="projectId"
                    multiSelect={false}
                    selectedValue={
                      field.value
                        ? (projectListdata?.data?.find(
                            (item) => item.projectId === field.value,
                          ) as Record<string, unknown> | undefined)
                        : undefined
                    }
                    handleChange={(selected) => {
                      if (
                        selected &&
                        typeof selected === "object" &&
                        "projectId" in selected
                      ) {
                        field.onChange(selected.projectId);
                      } else {
                        field.onChange("");
                      }
                    }}
                    onCheckbox={() => true}
                    paginationDetails={projectListdata as PaginationFilter}
                    setPaginationFilter={setPaginationFilterProject}
                  />
                </>
              )}
            />
          </Card>
        )}
        {step === 2 && (
          <Card className="px-4 py-4">
            <div className="flex items-center space-x-5 tb:space-x-7">
              {permission.MEETING_LIST?.Add && (
                <Link to="/dashboard/meeting/add?from=task">
                  <Button className="py-2 w-fit">Add Meeting</Button>
                </Link>
              )}
            </div>
            <Controller
              name="meeting"
              control={control}
              rules={{ required: "Please select a meeting" }}
              render={({ field }) => (
                <>
                  {errors?.meeting && (
                    <div className="mt-2">
                      <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                        this field is required
                      </span>
                    </div>
                  )}
                  <TableData
                    tableData={meetingData?.data?.map((item, index) => ({
                      ...item,
                      srNo:
                        (meetingData.currentPage - 1) * meetingData.pageSize +
                        index +
                        1,
                    }))}
                    isActionButton={() => false}
                    columns={{
                      meetingName: "Meeting Name",
                    }}
                    primaryKey="meetingId"
                    multiSelect={false}
                    selectedValue={
                      field.value
                        ? (meetingData?.data?.find(
                            (item) => item.meetingId === field.value,
                          ) as Record<string, unknown> | undefined)
                        : undefined
                    }
                    handleChange={(selected) => {
                      if (
                        selected &&
                        typeof selected === "object" &&
                        "meetingId" in selected
                      ) {
                        field.onChange(selected.meetingId);
                      } else {
                        field.onChange("");
                      }
                    }}
                    onCheckbox={() => true}
                    paginationDetails={meetingData as PaginationFilter}
                    setPaginationFilter={setPaginationFilterMeeting}
                  />
                </>
              )}
            />
          </Card>
        )}

        {/* Step 3 - Basic Info */}
        {step === 3 && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="col-span-2 px-4 py-4 grid grid-cols-2 gap-4">
              <div>
                <FormInputField
                  label="Task Name"
                  {...register("taskName", {
                    required: "Task Name is required",
                  })}
                  error={errors.taskName}
                />
                <div className="mt-2">
                  <label className="block mb-1 font-medium">
                    Task Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full border rounded-md p-2 text-base min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={5}
                    {...register("taskDescription", {
                      required: "Please Enter Task Description",
                    })}
                  />
                  {errors.taskDescription && (
                    <span className="text-red-600 text-sm">
                      {errors.taskDescription.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {/* Repetition Selection */}
                <Controller
                  control={control}
                  name="repetition"
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

                {/* Date Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {methods.watch("repetition") === "none" && (
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
                  )}

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
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <Controller
                      control={control}
                      name="taskStatusId"
                      rules={{ required: "Please select Task Status" }}
                      render={({ field }) => (
                        <FormSelect
                          label="Task Status"
                          options={taskStatusOptions}
                          error={errors.taskStatusId}
                          {...field}
                          isMandatory={true}
                        />
                      )}
                    />
                  </div>
                  <div className="w-1/2">
                    <Controller
                      control={control}
                      name="taskTypeId"
                      rules={{ required: "Please select Task Type" }}
                      render={({ field }) => (
                        <FormSelect
                          label="Task Type"
                          options={taskTypeOptions}
                          error={errors.taskTypeId}
                          {...field}
                          isMandatory={true}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 4 - Assign User */}
        {step === 4 && (
          <Card className="px-4 py-4">
            <Controller
              name="assignUser"
              control={control}
              rules={{ required: "Please select a User" }}
              render={({ field }) => {
                // Map selected IDs to employee objects for default selection
                const selectedEmployees =
                  Array.isArray(field.value) &&
                  Array.isArray(employeedata?.data)
                    ? employeedata.data.filter((emp) =>
                        field.value.includes(emp.employeeId),
                      )
                    : [];
                return (
                  <>
                    {errors?.assignUser && (
                      <div className="mt-2">
                        <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                          this field is required
                        </span>
                      </div>
                    )}
                    <TableData
                      tableData={employeedata?.data?.map((item, index) => ({
                        ...item,
                        srNo:
                          (employeedata.currentPage - 1) *
                            employeedata.pageSize +
                          index +
                          1,
                      }))}
                      isActionButton={() => false}
                      columns={{
                        employeeName: "User Name",
                      }}
                      primaryKey="employeeId"
                      multiSelect={true}
                      selectedValue={
                        selectedEmployees as unknown as Record<
                          string,
                          unknown
                        >[]
                      }
                      handleChange={(selected) => {
                        // Convert selected employee objects to array of IDs for form state
                        const ids = Array.isArray(selected)
                          ? selected.map((emp) => emp.employeeId)
                          : [];
                        field.onChange(ids);
                      }}
                      onCheckbox={() => true}
                      paginationDetails={employeedata as PaginationFilter}
                      setPaginationFilter={setPaginationFilterEmployee}
                    />
                  </>
                );
              }}
            />
          </Card>
        )}

        {/* Step 5 - Comment (Optional) */}
        {!taskId && step === 5 && (
          <Card className="px-4 py-4">
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
