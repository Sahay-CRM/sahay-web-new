import { AlertCircle, Camera, Check, Mic, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefObject, useState } from "react";

interface FormOnboardingProps {
  formName: string;
  formSettings: FormSettings;
  onboardingStep: number;
  getRules: () => string[];
  handleAccessCheck: () => void;
  videoRef: RefObject<HTMLVideoElement | null>;
  hwStatus: {
    camera: "pending" | "granted" | "denied";
    mic: "pending" | "granted" | "denied";
  };
  screenShareError: string | null;
}

const FormOnboarding = ({
  formName,
  formSettings,
  onboardingStep,
  getRules,
  handleAccessCheck,
  videoRef,
  hwStatus,
  screenShareError,
}: FormOnboardingProps) => {
  const [isAgreed, setIsAgreed] = useState(false);
  const rules = getRules();
  const needsCamera = !!formSettings.cameraPermissionCheck;
  const needsMic = !!formSettings.microphonePermissionAwareness;
  const needsScreen = !!formSettings.autoScreenshotCapture;

  const steps: string[] = [];
  if (rules.length > 0) steps.push("rules");
  if (needsCamera || needsMic) steps.push("hardware");
  if (needsScreen) steps.push("screen");

  const currentStep = steps[onboardingStep];

  const getTitle = () => {
    if (rules.length > 0 && onboardingStep === 0) return "Form Rules";
    if (onboardingStep === (rules.length > 0 ? 1 : 0)) return "Hardware Check";
    if (onboardingStep === (rules.length > 0 ? 2 : 1))
      return "Screen Permission";
    return "Ready to Start";
  };

  return (
    <div className="min-h-screen bg-[#f8f8fb] flex flex-col items-center justify-center p-4">
      <style>{`.mirror { transform: scaleX(-1); }`}</style>

      <div className="w-full max-w-md">
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#2f328e]/10 flex items-center justify-center mb-6">
            <ShieldCheck className="w-8 h-8 text-[#2f328e]" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {getTitle()}
            </h1>
            <p className="text-gray-500 text-sm">
              {formName} — Complete the following steps to access the form.
            </p>
          </div>

          <div className="w-full space-y-6">
            {/* ── Rules Step ─────────────────────────────────────────────── */}
            {currentStep === "rules" && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 max-h-[300px] overflow-y-auto space-y-3">
                  {rules.map((rule, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#2f328e] shrink-0" />
                      <span className="text-sm text-gray-700 font-medium">
                        {rule}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Agreement Checkbox */}
                <div
                  className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50 cursor-pointer"
                  onClick={() => setIsAgreed(!isAgreed)}
                >
                  <input
                    type="checkbox"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#2f328e] focus:ring-[#2f328e] cursor-pointer"
                    id="agree-rules"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <label
                    htmlFor="agree-rules"
                    className="text-xs text-gray-600 font-semibold cursor-pointer select-none"
                  >
                    I have read the rules and agree to follow them during the
                    submission.
                  </label>
                </div>

                <Button
                  onClick={handleAccessCheck}
                  disabled={!isAgreed}
                  className={cn(
                    "w-full h-12 text-sm font-bold rounded-xl shadow-lg transition-all",
                    isAgreed
                      ? "bg-[#2f328e] hover:bg-[#1e205e] text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none",
                  )}
                >
                  Agree & Continue
                </Button>
              </div>
            )}

            {/* ── Hardware Step ───────────────────────────────────────────── */}
            {currentStep === "hardware" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {needsCamera && (
                    <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                      {hwStatus.camera === "granted" ? (
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover mirror"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                          <Camera className="w-8 h-8 opacity-20 mb-2" />
                          <p className="text-[10px] font-bold uppercase tracking-wider">
                            Camera Required
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {needsMic && (
                    <div
                      className={cn(
                        "p-4 rounded-xl border flex items-center justify-between",
                        hwStatus.mic === "granted"
                          ? "bg-green-50 border-green-100"
                          : "bg-gray-50 border-gray-200",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Mic
                          className={cn(
                            "w-5 h-5",
                            hwStatus.mic === "granted"
                              ? "text-green-600"
                              : "text-gray-400",
                          )}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Microphone Access
                        </span>
                      </div>
                      {hwStatus.mic === "granted" && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  )}
                </div>

                {(hwStatus.camera === "denied" ||
                  hwStatus.mic === "denied") && (
                  <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg border border-red-100 text-center">
                    Permissions Denied. Please allow camera/mic access from your
                    browser address bar and click again.
                  </p>
                )}

                <Button
                  onClick={handleAccessCheck}
                  className="w-full h-12 text-sm font-bold bg-[#2f328e] hover:bg-[#1e205e] text-white rounded-xl shadow-lg"
                >
                  {(needsCamera && hwStatus.camera !== "granted") ||
                  (needsMic && hwStatus.mic !== "granted")
                    ? "Grant Permissions"
                    : "Next Step"}
                </Button>
              </div>
            )}

            {/* ── Screen Share Step ───────────────────────────────────────── */}
            {currentStep === "screen" && (
              <div className="space-y-4 text-center">
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
                  <ShieldCheck className="w-10 h-10 text-[#2f328e] mx-auto mb-3" />
                  <p className="text-sm text-[#2f328e] font-semibold">
                    Share Your Entire Screen
                  </p>
                  <p className="text-xs text-[#2f328e]/70 mt-2 leading-relaxed">
                    Click the button below. In the dialog that appears, select
                    the <strong>&ldquo;Entire Screen&rdquo;</strong> tab (not a
                    window or browser tab). This is required for proctoring.
                  </p>
                  <div className="mt-4 bg-white border border-blue-100 rounded-lg p-3 text-left">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Steps:
                    </p>
                    <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                      <li>
                        Click <b>&ldquo;Grant Screen Permission&rdquo;</b> below
                      </li>
                      <li>
                        In Chrome&apos;s dialog, choose{" "}
                        <b>&ldquo;Entire Screen&rdquo;</b>
                      </li>
                      <li>
                        Click <b>&ldquo;Share&rdquo;</b>
                      </li>
                    </ol>
                  </div>
                </div>

                {screenShareError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">
                        Wrong Selection
                      </p>
                      <p className="text-xs text-red-600 mt-0.5">
                        {screenShareError}
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAccessCheck}
                  className="w-full h-12 text-sm font-bold bg-[#2f328e] hover:bg-[#1e205e] text-white rounded-xl shadow-lg"
                >
                  {screenShareError ? "Try Again" : "Grant Screen Permission"}
                </Button>
              </div>
            )}

            {/* ── Completion Step ─────────────────────────────────────────── */}
            {!currentStep && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-100 p-6 rounded-xl text-center">
                  <Check className="w-10 h-10 text-green-500 mx-auto mb-2" />
                  <p className="text-green-700 font-bold">
                    Verification Complete
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    You can now proceed to the form.
                  </p>
                </div>
                <Button
                  onClick={handleAccessCheck}
                  className="w-full h-14 text-sm font-bold bg-[#2f328e] hover:bg-[#1e205e] text-white rounded-xl shadow-lg"
                >
                  Enter Form
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormOnboarding;
