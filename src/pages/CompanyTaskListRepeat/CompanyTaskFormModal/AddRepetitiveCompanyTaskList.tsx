import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

import useStepForm from "@/components/shared/StepProgress/useStepForm";
import useAddCompanyTaskList from "./useAddCompanyTaskList";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";

import AddRepetitiveTaskModal from "./addRepetitiveTaskModal";
import StepProgress from "@/components/shared/StepProgress";

export default function AddRepetitiveTask() {
  const {
    showNextStep,
    isPending,
    onFinish,
    trigger,
    isModalOpen,
    employeePreview,
    handleClose,
    onSubmit,
    setValue,
    repetitiveTaskId,
    taskDataById,
    ProjectSelectionStep,
    MeetingSelectionStep,
    TaskDetailsStep,
    projectListdata,
    meetingData,
    AssignUserStep,
    isChildData,
    handleKeepAll,
    handleDeleteAll,
  } = useAddCompanyTaskList();

  const [searchParams] = useSearchParams();
  const { setBreadcrumbs } = useBreadcrumbs();

  let projectId = searchParams.get("projectId") || "";
  let meetingId = searchParams.get("meetingId") || "";

  projectId = projectId.replace(/[?&]+$/, "");
  meetingId = meetingId.replace(/[?&]+$/, "");

  const steps = showNextStep
    ? [
        <ProjectSelectionStep key="project" />,
        <MeetingSelectionStep key="meeting" />,
        <TaskDetailsStep key="task" />,
        <AssignUserStep key="assign-user" />,
      ]
    : [];

  const { back, next, totalSteps, currentStep, isFirstStep, isLastStep, goTo } =
    useStepForm(steps, trigger);

  const jumpedRef = useRef(false);

  useEffect(() => {
    if (projectId && projectListdata?.data) {
      const projObj = projectListdata.data.find(
        (p) => p.projectId === projectId,
      );
      if (projObj) setValue("project", projObj, { shouldDirty: true });
    }
  }, [projectId, projectListdata?.data, setValue]);

  useEffect(() => {
    if (meetingId && meetingData?.data) {
      const meetObj = meetingData.data.find((m) => m.meetingId === meetingId);
      if (meetObj) setValue("meeting", meetObj, { shouldDirty: true });
    }
  }, [meetingId, meetingData?.data, setValue]);

  useEffect(() => {
    if (
      !jumpedRef.current &&
      projectId &&
      meetingId &&
      projectListdata?.data &&
      meetingData?.data
    ) {
      jumpedRef.current = true;
      setTimeout(() => goTo(2), 50);
    }
  }, [projectId, meetingId, projectListdata?.data, meetingData?.data, goTo]);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Repeat Tasks", href: "/dashboard/tasksrepeat" },
      {
        label: repetitiveTaskId
          ? "Update Repetition Task"
          : "Add Repetition Task",
        href: "",
      },
      ...(repetitiveTaskId
        ? [
            {
              label: taskDataById?.data?.taskName || "",
              href: `/dashboard/kpi/${repetitiveTaskId}`,
              isHighlight: true,
            },
          ]
        : []),
    ]);
  }, [setBreadcrumbs, taskDataById?.data?.taskName, repetitiveTaskId]);

  const stepNames = ["Project", "Meeting", "Basic Info", "Assign User"];

  return (
    <div className="w-full px-2 sm:px-4 py-4 overflow-x-auto">
      <StepProgress
        currentStep={currentStep}
        stepNames={stepNames}
        totalSteps={totalSteps}
        back={back}
        isFirstStep={isFirstStep}
        next={next}
        isLastStep={isLastStep}
        isPending={isPending}
        onFinish={onFinish}
        isUpdate={!!repetitiveTaskId}
      />

      <div className="step-content w-full">{steps[currentStep - 1]}</div>

      {isModalOpen && (
        <AddRepetitiveTaskModal
          modalData={employeePreview as TaskPreviewData}
          isModalOpen={isModalOpen}
          modalClose={handleClose}
          onSubmit={onSubmit}
          isLoading={isPending}
          isChildData={isChildData}
          onKeepAll={handleKeepAll}
          onDeleteAll={handleDeleteAll}
        />
      )}
    </div>
  );
}
