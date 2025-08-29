import { Controller, FormProvider, useFormContext } from "react-hook-form";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import StepProgress from "@/components/shared/StepProgress/stepProgress";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import { useAddCompanyTask } from "./useAddCompanyTaskList";
import TableData from "@/components/shared/DataTable/DataTable";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import SearchInput from "@/components/shared/SearchInput";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import PageNotAccess from "@/pages/PageNoAccess";

/* ---------------- Project Step ---------------- */
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

/* ---------------- Meeting Step ---------------- */
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
    <div className="p-0">
      <div className="flex items-center justify-between mb-4 space-x-5 tb:space-x-7">
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
              srNo: "srNo",
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

/* ---------------- Task Details Step ---------------- */
const TaskDetailsStep = ({ taskId }: { taskId: string }) => {
  const {
    register,
    control,
    formState: { errors },
    setValue,
  } = useFormContext();
  const { taskStatusOptions, taskTypeOptions } = useAddCompanyTask();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 mt-4 px-6 py-6 grid grid-cols-6 gap-4 h-[calc(100vh-250px)] content-start">
        <div className="col-span-3">
          <FormInputField
            label="Task Name"
            className="p-5 px-3"
            {...register("taskName", { required: "Task Name is required" })}
            error={errors.taskName}
            placeholder="Enter Task Name"
          />
        </div>
        <div className="col-span-3">
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

        {/* Row 2 */}
        {/* <div className="col-span-2"> */}
        {/* {watchForm("repetition") === "none" && (
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
            )} */}
        {/*
        </div> */}
        <div className="col-span-3">
          <Controller
            control={control}
            name="taskTypeId"
            rules={{ required: "Please select Task Type" }}
            render={({ field }) => (
              <SearchDropdown
                options={taskTypeOptions}
                selectedValues={field.value ? [field.value] : []}
                onSelect={(value) => {
                  field.onChange(value.value);
                  setValue("taskTypeId", value.value);
                }}
                placeholder="Select Task Type..."
                label="Task Type"
                error={errors.taskTypeId}
                isMandatory
              />
            )}
          />
        </div>
        <div className="col-span-3">
          <Controller
            control={control}
            name="taskStatusId"
            rules={{ required: "Please select Task Status" }}
            render={({ field }) => (
              <SearchDropdown
                options={taskStatusOptions}
                selectedValues={field.value ? [field.value] : []}
                onSelect={(value) => {
                  field.onChange(value.value);
                  setValue("taskStatusId", value.value);
                }}
                placeholder="Select Task Status..."
                label="Task Status"
                error={errors.taskStatusId}
                isMandatory
              />
            )}
          />
        </div>
        <div className="col-span-3">
          <label className="block mb-1 font-medium">
            Task Description <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border rounded-md p-2 text-base h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="col-span-3">
          <label className="block mb-1 font-medium" hidden={!!taskId}>
            Comment
          </label>
          <textarea
            className="w-full border rounded-md p-2 text-base h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register("comment")}
            hidden={!!taskId}
          />
        </div>
      </div>
    </div>
  );
};

/* ---------------- Assign User Step ---------------- */
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
  } = useAddCompanyTask();

  return (
    <div>
      <div className="flex items-center justify-between mb-4 space-x-5 tb:space-x-7">
        <div className="flex items-center gap-4">
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
          const selectedEmployees =
            Array.isArray(field.value) && Array.isArray(employeedata?.data)
              ? employeedata.data.filter((emp) =>
                  field.value.includes(emp.employeeId),
                )
              : [];
          return (
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
                srNo: "srNo",
                employeeName: "User Name",
                designationName: "Designation",
                employeeType: "Employee Type",
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
          );
        }}
      />
    </div>
  );
};

// const CommentStep = () => {
//   const {
//     register,
//     formState: { errors },
//   } = useFormContext();
//   return (
//     <Card className="px-4 py-4">
//       <FormInputField
//         label="Comment"
//         {...register("comment")}
//         error={errors.comment}
//       />
//     </Card>
//   );
// };

// Renamed main component

export default function AddCompanyTask() {
  const hookProps = useAddCompanyTask();
  const {
    step,
    nextStep,
    prevStep,
    onSubmit,
    steps: stepNamesArray,
    methods,
    taskId,
    taskDataById,
    isPending,
    taskPermission,
  } = hookProps;

  const { setBreadcrumbs } = useBreadcrumbs();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");

  const { handleSubmit, setValue } = methods;

  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Task", href: "/dashboard/tasks" },
      { label: taskId ? "Update Task" : "Add Task", href: "" },
      ...(taskId
        ? [
            {
              label: taskDataById?.data.taskName || "",
              href: `/dashboard/kpi/${taskId}`,
              isHighlight: true,
            },
          ]
        : []),
    ]);
  }, [setBreadcrumbs, taskDataById?.data.taskName, taskId]);

  useEffect(() => {
    if (projectId) {
      setValue("project", projectId);
    }
  }, [projectId, setValue]);

  const effectiveStep = projectId ? step + 1 : step;
  const totalSteps = 4;

  // ✅ next handler with validation
  const handleNext = handleSubmit(
    () => nextStep(),
    () => {}, // stay on same step if error
  );

  const renderStepContent = () => {
    switch (effectiveStep) {
      case 1:
        return <ProjectSelectionStep key="projectStep" />;
      case 2:
        return <MeetingSelectionStep key="meetingStep" />;
      case 3:
        return <TaskDetailsStep key="detailsStep" taskId={taskId!} />;
      case 4:
        return <AssignUserStep key="assignUserStep" />;
      default:
        return null;
    }
  };

  if (!taskPermission || taskPermission.Add === false) {
    return <PageNotAccess />;
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-6">
        <StepProgress
          currentStep={effectiveStep}
          totalSteps={totalSteps}
          stepNames={stepNamesArray} // ⚡ अब slice मत करो, सारे step दिखेंगे
          back={prevStep}
          isFirstStep={projectId ? effectiveStep === 2 : effectiveStep === 1}
          isLastStep={effectiveStep === totalSteps}
          next={handleNext}
          isPending={isPending}
          onFinish={handleSubmit(onSubmit)}
          isUpdate={!!taskId}
        />

        {renderStepContent()}
      </div>
    </FormProvider>
  );
}
