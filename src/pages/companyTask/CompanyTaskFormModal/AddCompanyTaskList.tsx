import { Controller, FormProvider, useFormContext } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import StepProgress from "@/components/shared/StepProgress/stepProgress";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import { useAddCompanyTask } from "./useAddCompanyTaskList";

import { useGetCompanyTaskSearch } from "@/features/api/companyTask";
import TableData from "@/components/shared/DataTable/DataTable";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import SearchInput from "@/components/shared/SearchInput";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import PageNotAccess from "@/pages/PageNoAccess";
import CompanyAccessGuard from "@/components/shared/CompanyAccessGuard/CompanyAccessGuard";
import { useSelector } from "react-redux";
import { getCompaniesList } from "@/features/selectors/company.selector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

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
            tableData={meetingData?.data?.map((item, index) => ({
              ...item,
              isDetailMeeting: item.isDetailMeeting ?? false,
              srNo:
                (meetingData.currentPage - 1) * meetingData.pageSize +
                index +
                1,
            }))}
            isActionButton={() => false}
            columns={{
              srNo: "srNo",
              meetingName: "Meeting Name",
              isDetailMeeting: "Live Meeting",
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
const TaskDetailsStep = ({
  taskId,
  isEditMode,
  deadlineRequest,
}: {
  taskId: string;
  isEditMode: boolean;
  deadlineRequest?: string;
}) => {
  const {
    register,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();
  const {
    taskStatusOptions,
    taskTypeOptions,
    setIsTypeSearch,
    setIsStatusSearch,
  } = useAddCompanyTask();

  const taskNameValue = watch("taskName") || "";

  // In edit mode, track the original name so dropdown only shows when user changes it
  const [originalName, setOriginalName] = useState<string | null>(null);
  const [nameChanged, setNameChanged] = useState(false);

  useEffect(() => {
    if (
      isEditMode &&
      originalName === null &&
      taskNameValue.trim().length > 0
    ) {
      setOriginalName(taskNameValue);
    }
  }, [isEditMode, originalName, taskNameValue]);

  useEffect(() => {
    if (isEditMode && originalName !== null) {
      setNameChanged(taskNameValue !== originalName);
    }
  }, [isEditMode, originalName, taskNameValue]);

  const shouldSearch = !isEditMode || nameChanged;
  const { data: taskSearchData } = useGetCompanyTaskSearch(
    shouldSearch ? taskNameValue : "",
  );

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isEditMode && !nameChanged) {
      setShowDropdown(false);
      return;
    }
    const hasResults =
      (taskSearchData?.data?.length ?? 0) > 0 &&
      taskNameValue.trim().length >= 5;

    if (hasResults) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [taskNameValue, taskSearchData, isEditMode, nameChanged]);

  const showResults =
    shouldSearch &&
    showDropdown &&
    taskNameValue.trim().length >= 5 &&
    (taskSearchData?.data?.length ?? 0) > 0;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="col-span-2 mt-4 px-6 py-6 grid grid-cols-6 gap-4 h-fit content-start">
        <div className="col-span-3 relative z-50" ref={dropdownRef}>
          <FormInputField
            label="Task Name"
            className="p-5 px-3"
            {...register("taskName", { required: "Task Name is required" })}
            error={errors.taskName}
            placeholder="Enter Task Name"
            onFocus={() => {
              if (
                shouldSearch &&
                taskNameValue.trim().length >= 5 &&
                (taskSearchData?.data?.length ?? 0) > 0
              ) {
                setShowDropdown(true);
              }
            }}
          />
          {showResults && (
            <div className="absolute top-[100%] mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              <div className="px-3 py-2 text-[12px]  text-gray-500 bg-gray-50 border-b border-gray-200 sticky top-0">
                Similar Tasks Found
              </div>
              {taskSearchData?.data?.map((item: SearchResponse) => (
                <div
                  key={item.taskId}
                  className="px-3 py-2 text-sm text-gray-700 border-b last:border-b-0 cursor-default hover:bg-gray-50"
                >
                  <span className="font-medium">{item.taskName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="col-span-3">
          <Controller
            control={control}
            name="taskDeadline"
            rules={{ required: "Task Deadline is required" }}
            render={({ field }) => (
              <div>
                <FormDateTimePicker
                  label="Task Deadline"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.taskDeadline}
                  disablePastDays={
                    Number(import.meta.env.VITE_DISABLEPASTDATES) || 3
                  }
                  disabled={deadlineRequest === "PENDING"}
                />
                {deadlineRequest === "PENDING" && (
                  <p className="text-xs text-primary mt-1">
                    Deadline change request is pending approval
                  </p>
                )}
              </div>
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
                onSearchChange={setIsTypeSearch}
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
                onSearchChange={setIsStatusSearch}
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
      </Card>
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
          const selectedEmployees = Array.isArray(field.value)
            ? field.value.map((id) => ({ employeeId: id }))
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
                srNo: "sr No",
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
    isConfModalOpen,
    setIsConfModalOpen,
    reasons,
    setReasons,
    onConfirmSubmit,
  } = hookProps;

  const { setBreadcrumbs } = useBreadcrumbs();
  const [searchParams] = useSearchParams();

  const companiesList = useSelector(getCompaniesList);
  const currentCompany = companiesList?.find((c) => c.isCurrentCompany);
  const resourceCompanyId = taskDataById?.data?.companyId;
  const isAuthorized =
    !taskId ||
    !resourceCompanyId ||
    resourceCompanyId === currentCompany?.companyId;

  let projectId = searchParams.get("projectId") || "";
  let meetingId = searchParams.get("meetingId") || "";

  // remove unwanted "?" or "&" from the end
  projectId = projectId.replace(/[?&]+$/, "");
  meetingId = meetingId.replace(/[?&]+$/, "");

  const { handleSubmit, setValue } = methods;

  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Task", href: "/dashboard/tasks" },
      { label: taskId ? "Update Task" : "Add Task", href: "" },
      ...(taskId && isAuthorized
        ? [
            {
              label: taskDataById?.data.taskName || "",
              href: `/dashboard/kpi/${taskId}`,
              isHighlight: true,
            },
          ]
        : []),
    ]);
  }, [setBreadcrumbs, taskDataById?.data.taskName, taskId, isAuthorized]);

  useEffect(() => {
    if (projectId) {
      setValue("project", projectId);
    }
    if (meetingId) {
      setValue("meeting", meetingId);
    }
  }, [meetingId, projectId, setValue]);

  const effectiveStep = (() => {
    let adjustedStep = step;

    if (projectId) adjustedStep += 1;
    if (meetingId) adjustedStep += 1;

    return adjustedStep;
  })();

  const totalSteps = 4;

  const handleNext = handleSubmit(
    () => nextStep(),
    () => {},
  );

  const renderStepContent = () => {
    switch (effectiveStep) {
      case 1:
        return <ProjectSelectionStep key="projectStep" />;
      case 2:
        return <MeetingSelectionStep key="meetingStep" />;
      case 3:
        return (
          <TaskDetailsStep
            key="detailsStep"
            taskId={taskId!}
            isEditMode={!!taskId}
            deadlineRequest={taskDataById?.data?.deadlineRequest}
          />
        );
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
    <CompanyAccessGuard
      companyId={taskId ? resourceCompanyId : undefined}
      isLoading={taskId ? !taskDataById : false}
    >
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

        <Dialog open={isConfModalOpen} onOpenChange={setIsConfModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmation Required</DialogTitle>
              <DialogDescription>
                The deadline has been changed. Please provide a reason to
                proceed with the update.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="reason" className="text-sm font-medium">
                  Reason
                </label>
                <Textarea
                  id="reason"
                  placeholder="Enter reasons for deadline change..."
                  value={reasons}
                  onChange={(e) => setReasons(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsConfModalOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirmSubmit}
                disabled={isPending || !reasons.trim()}
              >
                {isPending ? "Confirming..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </FormProvider>
    </CompanyAccessGuard>
  );
}
