/* eslint-disable @typescript-eslint/no-explicit-any */
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
  } = useAddCompanyTaskList();

  const [searchParams] = useSearchParams();
  const { setBreadcrumbs } = useBreadcrumbs();

  let projectId = searchParams.get("projectId") || "";
  let meetingId = searchParams.get("meetingId") || "";

  projectId = projectId.replace(/[?&]+$/, "");
  meetingId = meetingId.replace(/[?&]+$/, "");

  /* ✅ Steps */
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

  // ✅ prevent multiple auto jumps
  const jumpedRef = useRef(false);

  /* ✅ Auto-select project if URL has ?projectId */
  useEffect(() => {
    if (projectId && projectListdata?.data) {
      const projObj = projectListdata.data.find(
        (p: any) => p.projectId === projectId,
      );
      if (projObj) setValue("project", projObj, { shouldDirty: true });
    }
  }, [projectId, projectListdata?.data, setValue]);

  /* ✅ Auto-select meeting if URL has ?meetingId */
  useEffect(() => {
    if (meetingId && meetingData?.data) {
      const meetObj = meetingData.data.find(
        (m: any) => m.meetingId === meetingId,
      );
      if (meetObj) setValue("meeting", meetObj, { shouldDirty: true });
    }
  }, [meetingId, meetingData?.data, setValue]);

  /* ✅ Jump to Step 3 only after values are set */
  useEffect(() => {
    if (
      !jumpedRef.current &&
      projectId &&
      meetingId &&
      projectListdata?.data &&
      meetingData?.data
    ) {
      jumpedRef.current = true;
      setTimeout(() => goTo(2), 50); // 🎯 jump to Basic Info (0,1,2)
    }
  }, [projectId, meetingId, projectListdata?.data, meetingData?.data, goTo]);

  /* ✅ Breadcrumbs */
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
          modalData={employeePreview as any}
          isModalOpen={isModalOpen}
          modalClose={handleClose}
          onSubmit={onSubmit}
          isLoading={isPending}
        />
      )}
    </div>
  );
}
