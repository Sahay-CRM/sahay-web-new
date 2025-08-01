import { Controller, FormProvider, useFormContext } from "react-hook-form";
import { useEffect } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StepProgress from "@/components/shared/StepProgress/stepProgress";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import { useAddCompanyTask } from "./useAddCompanyTaskList";
import TableData from "@/components/shared/DataTable/DataTable";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import SearchInput from "@/components/shared/SearchInput";

const ProjectSelectionStep = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const {
    projectListdata,
    setPaginationFilterProject,
    permission,
    paginationFilterProject,
    projectLoading,
  } = useAddCompanyTask();

  return (
    <div className="p-0">
      <div className="flex items-center space-x-5 tb:space-x-7 mb-2 justify-between">
        <div className="flex gap-4">
          <SearchInput
            placeholder="Search Projects..."
            searchValue={paginationFilterProject?.search || ""}
            setPaginationFilter={setPaginationFilterProject}
            className="w-96"
          />
          {errors?.project && (
            <div className="mt-2">
              <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                {String(errors?.project?.message || "")}
              </span>
            </div>
          )}
        </div>
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
          <TableData
            tableData={projectListdata?.data?.map((item, index) => ({
              ...item,
              srNo:
                (projectListdata.currentPage - 1) * projectListdata.pageSize +
                index +
                1,
            }))}
            isActionButton={() => false}
            columns={{
              projectName: "Project Name",
            }}
            isLoading={projectLoading}
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
            showActionsColumn={false}
          />
        )}
      />
    </div>
  );
};

const MeetingSelectionStep = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const {
    meetingData,
    setPaginationFilterMeeting,
    permission,
    paginationFilterMeeting,
    meetingLoading,
  } = useAddCompanyTask();

  return (
    <div className="px-4 py-4">
      <div className=" mt-1 mb-4 flex items-center justify-between">
        <div className="flex items-center w-full">
          <SearchInput
            placeholder="Search..."
            searchValue={paginationFilterMeeting?.search || ""}
            setPaginationFilter={setPaginationFilterMeeting}
            className="w-80"
          />
          {errors?.meeting && (
            <div className="mt-2">
              <span className="text-red-600 w-fit text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                {String(errors?.meeting?.message || "This field is required")}
              </span>
            </div>
          )}
        </div>
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
            showActionsColumn={false}
            isLoading={meetingLoading}
          />
        )}
      />
    </div>
  );
};

const TaskDetailsStep = () => {
  const {
    register,
    control,
    formState: { errors },
    watch: watchForm,
  } = useFormContext();
  const { repetitionOptions, taskStatusOptions, taskTypeOptions } =
    useAddCompanyTask();

  return (
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
                {errors.taskDescription?.message as string}
              </span>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <Controller
            control={control}
            name="repeatType"
            render={({ field }) => (
              <FormSelect
                label="Repetition"
                options={repetitionOptions}
                placeholder="Select Repetition"
                value={field.value}
                onChange={field.onChange}
                error={errors.repeatType}
              />
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {watchForm("repetition") === "none" && (
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
  );
};

const AssignUserStep = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const {
    employeedata,
    setPaginationFilterEmployee,
    paginationFilterEmployee,
    employeeLoading,
  } = useAddCompanyTask(); // Assuming hook can be called here

  return (
    <div className="px-4 py-4">
      <div className=" mt-1 mb-4 flex items-center w-full">
        <SearchInput
          placeholder="Search..."
          searchValue={paginationFilterEmployee?.search || ""}
          setPaginationFilter={setPaginationFilterEmployee}
          className="w-80"
        />
        {errors?.assignUser && (
          <div className="mt-2">
            <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
              {String(errors?.assignUser?.message || "This field is required")}
            </span>
          </div>
        )}
      </div>
      <Controller
        name="assignUser"
        control={control}
        rules={{ required: "Please select a User" }}
        render={({ field }) => {
          const selectedEmployees =
            Array.isArray(field.value) && Array.isArray(employeedata?.data)
              ? employeedata.data.filter((emp) =>
                  field.value.includes(emp.employeeId),
                )
              : [];
          return (
            <>
              <TableData
                tableData={employeedata?.data?.map((item, index) => ({
                  ...item,
                  srNo:
                    (employeedata.currentPage - 1) * employeedata.pageSize +
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
                  selectedEmployees as unknown as Record<string, unknown>[]
                }
                handleChange={(selected) => {
                  const ids = Array.isArray(selected)
                    ? selected.map((emp) => emp.employeeId)
                    : [];
                  field.onChange(ids);
                }}
                onCheckbox={() => true}
                paginationDetails={employeedata as PaginationFilter}
                setPaginationFilter={setPaginationFilterEmployee}
                showActionsColumn={false}
                isLoading={employeeLoading}
              />
            </>
          );
        }}
      />
    </div>
  );
};

const CommentStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <Card className="px-4 py-4">
      <FormInputField
        label="Comment"
        {...register("comment")}
        error={errors.comment}
      />
    </Card>
  );
};

// Renamed main component
export default function AddCompanyTask() {
  const hookProps = useAddCompanyTask();
  const {
    step,
    nextStep,
    prevStep,
    onSubmit,
    steps: stepNamesArray, // Renamed to avoid conflict with step components
    methods,
    taskId,
    taskDataById,
    isPending,
  } = hookProps;

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Task", href: "/dashboard/tasks" },
      {
        label: taskId ? "Update Task" : "Add Task",
        href: "",
      },
      ...(taskId
        ? [
            {
              label: `${
                taskDataById?.data.taskName ? taskDataById?.data.taskName : ""
              }`,
              href: `/dashboard/kpi/${taskId}`,
            },
          ]
        : []),
    ]);
  }, [setBreadcrumbs, taskDataById?.data.taskName, taskId]);

  const { handleSubmit } = methods;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <ProjectSelectionStep key="projectStep" />;
      case 2:
        return <MeetingSelectionStep key="meetingStep" />;
      case 3:
        return <TaskDetailsStep key="detailsStep" />;
      case 4:
        return <AssignUserStep key="assignUserStep" />;
      case 5:
        if (!taskId) return <CommentStep key="commentStep" />; // Conditional step
        return null;
      default:
        return null;
    }
  };

  const totalSteps = taskId ? 4 : 5;

  return (
    <FormProvider {...methods}>
      <div className="w-full mx-auto px-4 mt-2">
        <StepProgress
          currentStep={step}
          totalSteps={totalSteps} // Use adjusted totalSteps
          stepNames={stepNamesArray}
          header={taskId ? taskDataById?.data.taskName : null}
          back={prevStep}
          // isFirstStep={isFirstStep}
          next={nextStep}
          // isLastStep={isLastStep}
          isPending={isPending}
          onFinish={handleSubmit(onSubmit)}
          isUpdate={!!taskId}
        />

        {renderStepContent()}
      </div>
    </FormProvider>
  );
}
