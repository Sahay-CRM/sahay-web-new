import { Controller, FormProvider, useFormContext } from "react-hook-form";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

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
import AddDatapointModal from "./addRepetitiveTaskModal";

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
      <div className="flex items-center space-x-5 tb:space-x-7 mb-4 justify-between">
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
            {...field}
            tableData={projectListdata?.data?.map((item, index) => ({
              ...item,
              srNo:
                (projectListdata.currentPage - 1) * projectListdata.pageSize +
                index +
                1,
            }))}
            isActionButton={() => false}
            columns={{
              srNo: "srNo",
              projectName: "Project Name",
            }}
            isLoading={projectLoading}
            primaryKey="projectId"
            multiSelect={false}
            selectedValue={
              field.value?.projectId
                ? (projectListdata?.data?.find(
                    (item) => item.projectId === field.value.projectId,
                  ) as Record<string, unknown> | undefined)
                : undefined
            }
            //  selectedValue={
            //   field.value
            //     ? (projectListdata?.data?.find(
            //         (item) => item.projectId === field.value
            //       ) as Record<string, unknown> | undefined)
            //     : undefined
            // }

            handleChange={(val) => {
              if (!val || (Array.isArray(val) && val.length === 0)) {
                field.onChange(undefined);
              } else if (Array.isArray(val)) {
                field.onChange(val[0]);
              } else {
                field.onChange(val);
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
    watch,
  } = useFormContext();
  const {
    meetingData,
    setPaginationFilterMeeting,
    permission,
    paginationFilterMeeting,
    meetingLoading,
  } = useAddCompanyTask();

  const projectId = watch("project");

  return (
    <div className="p-0">
      <div className="flex items-center justify-between mb-4 space-x-5 tb:space-x-7">
        {/* Left: Search + Error */}
        <div className="flex items-center gap-4">
          <SearchInput
            placeholder="Search..."
            searchValue={paginationFilterMeeting?.search || ""}
            setPaginationFilter={setPaginationFilterMeeting}
            className="w-80"
          />

          {errors?.meeting && (
            <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*'] whitespace-nowrap">
              {String(errors?.meeting?.message || "")}
            </span>
          )}
        </div>

        {/* Right: Button */}
        {permission.MEETING_LIST?.Add && (
          <Link to={`/dashboard/meeting/add?from=task&projectId=${projectId}`}>
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
            {...field}
            tableData={meetingData?.data?.map((item, index) => ({
              ...item,
              srNo:
                (meetingData.currentPage - 1) * meetingData.pageSize +
                index +
                1,
            }))}
            isActionButton={() => false}
            columns={{
              srNo: "srNo",
              meetingName: "Meeting Name",
            }}
            primaryKey="meetingId"
            multiSelect={false}
            selectedValue={
              field.value?.meetingId
                ? (meetingData?.data?.find(
                    (item) => item.meetingId === field.value.meetingId,
                  ) as Record<string, unknown> | undefined)
                : undefined
            }
            // selectedValue={
            //   field.value?.projectId
            //     ? (projectListdata?.data?.find(
            //         (item) => item.projectId === field.value.projectId
            //       ) as Record<string, unknown> | undefined)
            //     : undefined
            // }
            handleChange={(val) => {
              if (!val || (Array.isArray(val) && val.length === 0)) {
                field.onChange(undefined);
              } else if (Array.isArray(val)) {
                field.onChange(val[0]);
              } else {
                field.onChange(val);
              }
            }}
            // handleChange={(selected) => {
            //   if (
            //     selected &&
            //     typeof selected === "object" &&
            //     "meetingId" in selected
            //   ) {
            //     field.onChange(selected.meetingId);
            //   } else {
            //     field.onChange("");
            //   }
            // }}
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
  const taskDeadline = watchForm("taskDeadline"); // 👈 This is where we watch the date

  const { repetitionOptions, taskStatusOptions, taskTypeOptions } =
    useAddCompanyTask(taskDeadline);

  return (
    <div className="grid mb-10 grid-cols-2 gap-4">
      <Card className="col-span-2 mt-4 px-4 py-4 grid grid-cols-2 gap-4">
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
                  // disableDaysFromToday={5}
                />
              )}
            />
          </div>
          <Controller
            control={control}
            name="repeatType"
            rules={{ required: "Please select Repetition Type" }}
            render={({ field }) => (
              <FormSelect
                label="Repetition"
                options={repetitionOptions}
                placeholder="Select Repetition"
                {...field}
                // value={field.value || ""}
                // onChange={field.onChange}
                error={errors.repeatType}
                isMandatory={true}
                disabled={!taskDeadline}
              />
            )}
          />
          <div className="flex gap-4">
            <div className="w-1/2">
              <Controller
                control={control}
                name="isActive"
                rules={{ required: "Please select Any One Status" }}
                render={({ field }) => (
                  <FormSelect
                    label="Active/InActive"
                    options={taskStatusOptions}
                    error={errors.isActive}
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
    <div className="">
      <div className="flex items-center justify-between mb-4 space-x-5 tb:space-x-7">
        {/* Left: Search + Error */}
        <div className="flex  items-center gap-4">
          <SearchInput
            placeholder="Search..."
            searchValue={paginationFilterEmployee?.search || ""}
            setPaginationFilter={setPaginationFilterEmployee}
            className="w-80"
          />

          {errors?.assignUser && (
            <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*'] whitespace-nowrap">
              {String(errors?.assignUser?.message || "")}
            </span>
          )}
        </div>
      </div>

      <Controller
        name="assignUser"
        control={control}
        rules={{ required: "Please select a User" }}
        render={({ field }) => {
          return (
            <TableData
              {...field}
              tableData={employeedata?.data?.map((item, index) => ({
                ...item,
                srNo:
                  (employeedata.currentPage - 1) * employeedata.pageSize +
                  index +
                  1,
              }))}
              isActionButton={() => false}
              columns={{
                srNo: "srNo",
                employeeName: "User Name",
              }}
              primaryKey="employeeId"
              multiSelect={true}
              selectedValue={field.value || []} // whole employee objects
              handleChange={(selected) => {
                field.onChange(Array.isArray(selected) ? selected : []);
              }}
              onCheckbox={() => true}
              paginationDetails={employeedata as PaginationFilter}
              setPaginationFilter={setPaginationFilterEmployee}
              showActionsColumn={false}
              isLoading={employeeLoading}
            />
          );
        }}
      />
    </div>
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
    onFinish,
    isModalOpen,
    handleClose,
    taskpreviewData,
    steps: stepNamesArray, // Renamed to avoid conflict with step components
    methods,
    repetitiveTaskId,
    taskDataById,
    isPending,
  } = hookProps;

  const [searchParams] = useSearchParams();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { handleSubmit, setValue } = methods;

  let projectId = searchParams.get("projectId") || "";
  let meetingId = searchParams.get("meetingId") || "";

  // remove unwanted "?" or "&" from the end
  projectId = projectId.replace(/[?&]+$/, "");
  meetingId = meetingId.replace(/[?&]+$/, "");

  useEffect(() => {
    if (projectId) {
      setValue("project", projectId);
    }
    if (meetingId) {
      setValue("meeting", meetingId);
    }
  }, [meetingId, projectId, setValue]);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Repetition Task ", href: "/dashboard/tasksrepeat" },
      {
        label: repetitiveTaskId
          ? "Update Repetition Task"
          : "Add Repetition Task",
        href: "",
      },
      ...(repetitiveTaskId
        ? [
            {
              label: taskDataById?.data.taskName || "",
              href: `/dashboard/kpi/${repetitiveTaskId}`,
              isHighlight: true,
            },
          ]
        : []),
    ]);
  }, [setBreadcrumbs, taskDataById?.data.taskName, repetitiveTaskId]);

  const effectiveStep = (() => {
    let adjustedStep = step;

    if (projectId) adjustedStep += 1;
    if (meetingId) adjustedStep += 1;

    return adjustedStep;
  })();

  const renderStepContent = () => {
    switch (effectiveStep) {
      case 1:
        return <ProjectSelectionStep key="projectStep" />;
      case 2:
        return <MeetingSelectionStep key="meetingStep" />;
      case 3:
        return <TaskDetailsStep key="detailsStep" />;
      case 4:
        return <AssignUserStep key="assignUserStep" />;

      default:
        return null;
    }
  };

  const totalSteps = 4;

  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
        <div className="flex items-center gap-5 mb-3">
          <StepProgress
            currentStep={step}
            totalSteps={totalSteps} // Use adjusted totalSteps
            stepNames={stepNamesArray}
            back={prevStep}
            isFirstStep={step === 1} // ✅ add this
            isLastStep={step === totalSteps}
            next={nextStep}
            isPending={isPending}
            onFinish={onFinish}
            // onFinish={handleSubmit(onSubmit)}
            isUpdate={!!repetitiveTaskId}
          />
        </div>
        <div className="step-content w-full">{renderStepContent()}</div>{" "}
        {isModalOpen && (
          <AddDatapointModal
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            modalData={taskpreviewData as any}
            isModalOpen={isModalOpen}
            modalClose={handleClose}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={isPending}
          />
        )}
      </div>
    </FormProvider>
  );
}
