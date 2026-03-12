import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetFormById } from "@/features/api/Form";
import FormHeader from "../preview/components/FormHeader";
import FormSidebar from "../preview/components/FormSidebar";
import FormQuestions from "../preview/components/FormQuestions";
import {
  LoadingScreen,
  FormNotFoundScreen,
} from "../preview/components/FormStatusScreens";
import type { ResponseData } from "../preview/hooks/useFormPreviewPage";

const BuilderPreviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: formResponse, isLoading } = useGetFormById(id || "");
  const form = formResponse?.data as FormDetails | undefined;

  const [responses, setResponses] = useState<
    Record<string, string | string[] | File | FileList>
  >({});

  if (isLoading) return <LoadingScreen />;
  if (!form) return <FormNotFoundScreen />;

  const rawSettings = form.formSettings as unknown as {
    key: string;
    value: string;
  }[];
  const formSettings = (Array.isArray(rawSettings) ? rawSettings : []).reduce(
    (acc: Record<string, string | boolean | number>, item) => {
      acc[item.key] =
        item.value === "true"
          ? true
          : item.value === "false"
            ? false
            : item.value;
      return acc;
    },
    {},
  );

  const getRules = () => {
    const rules: string[] = [];
    const s = formSettings as unknown as FormSettings;
    if (s.tabSwitchDetection)
      rules.push(`Max ${s.maxTabSwitches} tab switches allowed`);
    if (s.focusLossDetection)
      rules.push(`Max ${s.maxFocusLoss} window focus losses`);
    if (s.fullscreenMonitoring) rules.push("Fullscreen mode monitoring");
    if (s.cameraPermissionCheck) rules.push("Camera proctoring active");
    if (s.microphonePermissionAwareness)
      rules.push("Microphone proctoring active");
    if (s.copyProtection) rules.push("Copying text is disabled");
    if (s.pasteProtection) rules.push("Pasting text is disabled");
    if (s.rightClickProtection) rules.push("Right-click is restricted");
    if (s.screenshotProtection) rules.push("Screenshots may be captured");
    if (s.pageRefreshWarning) rules.push("Page refresh is guarded");
    if (s.totalTimerEnabled)
      rules.push(`Total time limit: ${s.totalTimerMinutes} mins`);
    return rules;
  };

  return (
    <div className="h-screen bg-[#f8f9fc] flex flex-col overflow-hidden">
      {/* Visual indicator that this is a preview */}
      <div className="bg-indigo-600 px-4 py-2 flex items-center justify-center shrink-0 shadow-sm">
        <p className="text-[13px] text-white font-bold uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Preview Mode: Visualizing Form Layout
        </p>
      </div>

      <FormHeader
        formName={form.name}
        formDescription={form.description}
        formSettings={formSettings as unknown as FormSettings}
        timeRemaining={null}
        formatTime={() => "00:00"}
        tabSwitchCount={0}
        isScreenActive={false}
        hwStatusCamera="granted"
      />

      <div className="flex-1 flex overflow-auto">
        <FormSidebar
          verifiedName="User Name"
          verifiedMobile="----543210"
          formSettings={formSettings as unknown as FormSettings}
          form={form}
          responses={responses as unknown as ResponseData}
          getRules={getRules}
        />

        <FormQuestions
          form={form}
          responses={responses as unknown as ResponseData}
          updateResponse={(fieldId, value) => {
            setResponses((prev) => ({ ...prev, [fieldId]: value }));
          }}
          fieldErrors={{}}
          setResponses={(data) => setResponses(data as ResponseData)}
          handleSubmit={() => {}}
          isUploading={false}
          isSubmittingForm={false}
          isPreview={true}
        />
      </div>
    </div>
  );
};

export default BuilderPreviewPage;
