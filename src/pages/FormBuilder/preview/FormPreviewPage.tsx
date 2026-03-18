import { useFormPreviewPage } from "./hooks/useFormPreviewPage";
import {
  LoadingScreen,
  AlreadySubmittedScreen,
  SubmittedScreen,
  FormNotFoundScreen,
  TimerOverScreen,
} from "./components/FormStatusScreens";
import FormLoginStep from "./components/FormLoginStep";
import FormOnboarding from "./components/FormOnboarding";
import FormHeader from "./components/FormHeader";
import ViolationBar from "./components/ViolationBar";
import FormSidebar from "./components/FormSidebar";
import FormQuestions from "./components/FormQuestions";

const FormPreviewPage = () => {
  const {
    form,
    formSettings,
    isLoadingForm,
    responses,
    setResponses,
    updateResponse,
    fieldErrors,
    isSubmitted,
    isVerified,
    accessGranted,
    alreadySubmitted,
    isUploading,
    isSubmitting,
    isSubmittingForm,
    isSendingOtp,
    isVerifyingOtp,
    isScreenActive,
    screenShareError,
    timeRemaining,
    formatTime,
    submissionReason,
    handleSubmit,
    counts,
    onboardingStep,
    handleAccessCheck,
    getRules,
    statusSentOtp,
    otpFormMethods,
    register,
    handleOtpSubmit,
    setValue,
    errors,
    onOtpSubmit,
    verifiedName,
    verifiedMobile,
    videoRef,
    hwStatus,
    isMobile,
    // tabSwitchWarning,
    scoreString,
    submissionMessage,
  } = useFormPreviewPage();

  // Show warning modal on each new tab switch event
  // const [showTabWarning, setShowTabWarning] = useState(false);
  // useEffect(() => {
  //   if (tabSwitchWarning > 0) setShowTabWarning(true);
  // }, [tabSwitchWarning]);

  // ── Status Screens ───────────────────────────────────────────────────────
  if (isLoadingForm) return <LoadingScreen />;
  if (alreadySubmitted) return <AlreadySubmittedScreen form={form} />;
  if (isSubmitted)
    return (
      <SubmittedScreen
        form={form}
        submissionReason={submissionReason}
        scoreString={scoreString}
        submissionMessage={submissionMessage}
      />
    );
  if (!form) return <FormNotFoundScreen />;
  if (
    timeRemaining === 0 &&
    formSettings.totalTimerEnabled &&
    accessGranted &&
    !isSubmitting &&
    !isSubmitted
  )
    return <TimerOverScreen />;

  // ── Login (OTP) ──────────────────────────────────────────────────────────
  if (!isVerified) {
    return (
      <FormLoginStep
        otpFormMethods={otpFormMethods}
        register={register}
        handleOtpSubmit={handleOtpSubmit}
        setValue={setValue}
        errors={errors}
        onOtpSubmit={onOtpSubmit}
        statusSentOtp={statusSentOtp}
        isSendingOtp={isSendingOtp}
        isVerifyingOtp={isVerifyingOtp}
        formName={form.name}
      />
    );
  }

  // ── Onboarding (Rules / Hardware / Screen Share) ─────────────────────────
  if (!accessGranted) {
    return (
      <FormOnboarding
        formName={form.name}
        formSettings={formSettings}
        onboardingStep={onboardingStep}
        getRules={getRules}
        handleAccessCheck={handleAccessCheck}
        videoRef={videoRef}
        hwStatus={hwStatus}
        screenShareError={screenShareError}
        isMobile={isMobile}
      />
    );
  }

  // ── Main Form ────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-[#f8f9fc] flex flex-col overflow-hidden">
      {/* {showTabWarning && formSettings.tabSwitchDetection && (
        <TabSwitchWarningModal
          count={counts.tab_switch}
          maxSwitches={Number(formSettings.maxTabSwitches) || 3}
          onClose={() => setShowTabWarning(false)}
        />
      )} */}
      <FormHeader
        formName={form.name}
        formDescription={form.description}
        formSettings={formSettings}
        timeRemaining={timeRemaining}
        formatTime={formatTime}
        tabSwitchCount={counts.tab_switch}
        isScreenActive={isScreenActive}
        hwStatusCamera={hwStatus.camera}
      />

      <ViolationBar counts={counts} />

      <div className="flex-1 flex overflow-auto">
        <FormSidebar
          verifiedName={verifiedName}
          verifiedMobile={verifiedMobile}
          formSettings={formSettings}
          form={form}
          responses={responses}
          getRules={getRules}
        />

        <FormQuestions
          form={form}
          responses={responses}
          updateResponse={updateResponse}
          fieldErrors={fieldErrors}
          setResponses={setResponses}
          handleSubmit={handleSubmit}
          isUploading={isUploading}
          isSubmitting={isSubmitting}
          isSubmittingForm={isSubmittingForm}
        />
      </div>
    </div>
  );
};

export default FormPreviewPage;
