import { Button } from "@/components/ui/button";
import AddEmployeeModal from "./addMeetingModal";
import useAddEmployee from "./useAddMeeting";
import { FormProvider } from "react-hook-form";
import useStepForm from "@/components/shared/StepProgress/useStepForm";
import StepProgress from "@/components/shared/StepProgress/stepProgress";

const AddEmployee = () => {
  const {
    onFinish,
    isModalOpen,
    handleClose,
    onSubmit,
    MeetingInfo,
    MeetingStatus,
    MeetingType,
    Joiners,
    UploadDoc,
    trigger,
    meetingPreview,
    methods, // Add this to get form methods
  } = useAddEmployee();

  // Build steps array based on showNextStep
  const steps = [
    <MeetingInfo />,
    <MeetingStatus />,
    <MeetingType />,
    <Joiners />,
    <UploadDoc />,
  ];

  const {
    back,
    next,
    stepContent,
    totalSteps,
    currentStep,
    isFirstStep,
    isLastStep,
  } = useStepForm(steps, trigger);

  const stepNames = [
    "Meeting Info",
    "Meeting Status",
    "Meeting Type",
    "Joiners",
    "Upload Document",
  ];

  return (
    <FormProvider {...methods}>
      <div>
        <StepProgress
          currentStep={currentStep}
          stepNames={stepNames}
          totalSteps={totalSteps}
        />

        {/* Navigation Buttons */}
        <div className="flex justify-end gap-5 mb-5 ">
          <Button onClick={back} disabled={isFirstStep} className="w-fit">
            Previous
          </Button>
          <Button onClick={isLastStep ? onFinish : next} className="w-fit">
            {isLastStep ? "Finish" : "Next"}
          </Button>
        </div>

        {/* Step Content */}
        <div className="step-content w-full">{stepContent}</div>

        {/* Modal Component */}
        {isModalOpen && (
          <AddEmployeeModal
            modalData={meetingPreview as MeetingData}
            isModalOpen={isModalOpen}
            modalClose={handleClose}
            onSubmit={onSubmit}
          />
        )}
      </div>
    </FormProvider>
  );
};

export default AddEmployee;
