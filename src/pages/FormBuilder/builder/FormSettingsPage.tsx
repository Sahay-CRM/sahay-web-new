import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useGetForm, useUpdateForm } from "@/features/api/Form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, ArrowLeft } from "lucide-react";

// Parse API settings array → flat object
function parseApiSettings(raw: unknown): Partial<FormSettings> {
  if (!raw) return {};
  if (Array.isArray(raw)) {
    return raw.reduce(
      (acc, item: { key: string; value: string }) => {
        let parsed: string | boolean | number = item.value;
        if (item.value === "true") parsed = true;
        else if (item.value === "false") parsed = false;
        else if (!isNaN(Number(item.value)) && item.value !== "")
          parsed = Number(item.value);
        acc[item.key] = parsed;
        return acc;
      },
      {} as Record<string, unknown>,
    );
  }
  if (typeof raw === "object") return raw as Partial<FormSettings>;
  return {};
}

export default function FormSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { data: formData, isLoading } = useGetForm(id || "");
  const { mutate: updateForm, isPending: isUpdating } = useUpdateForm();

  const [mobileInput, setMobileInput] = useState("");
  const [mobileNumbers, setMobileNumbers] = useState<string[]>([]);
  const [settings, setSettings] = useState<Partial<FormSettings>>({});

  const { watch, setValue, reset } = useForm<FormDetails>();
  const formName = watch("name") || "";
  const isActive = watch("isActive") ?? true;
  const visibility = watch("visibility") || "PUBLIC";
  const notificationEmail = watch("notificationEmail") || "";

  useEffect(() => {
    if (formData?.data) {
      const d = formData.data;
      reset({ ...d, formSettings: {} });
      setMobileNumbers(d.mobileNumbers || []);
      setSettings(parseApiSettings(d.formSettings));
    }
  }, [formData, reset]);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Forms", href: "/dashboard/forms" },
      { label: formName || "Form", href: "" },
      { label: "Settings", href: "" },
    ]);
  }, [setBreadcrumbs, formName]);

  const updateSetting = (updates: Partial<FormSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const addMobileNumber = () => {
    if (mobileInput && !mobileNumbers.includes(mobileInput)) {
      setMobileNumbers((prev) => [...prev, mobileInput]);
      setMobileInput("");
    }
  };

  const removeMobileNumber = (num: string) => {
    setMobileNumbers((prev) => prev.filter((n) => n !== num));
  };

  const handleSave = () => {
    if (!id) return;
    updateForm({
      id,
      data: {
        name: formName,
        isActive,
        visibility,
        notificationEmail,
        mobileNumbers,
        formSettings: settings,
      } as Partial<FormDetails>,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-[#2f328e]" />
        <span className="ml-2 text-sm text-gray-500">Loading settings...</span>
      </div>
    );
  }

  const fs = settings as FormSettings;

  return (
    <div className="w-full px-2 sm:px-4 py-4">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-500"
            onClick={() => navigate(`/dashboard/form-builder?id=${id}`)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="font-semibold text-xl text-black">
              {formName || "Form"}
            </h1>
            <p className="text-xs text-gray-500">Settings</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          className="bg-[#2f328e] hover:bg-[#1a1c5d] text-white"
          disabled={isUpdating}
        >
          {isUpdating ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="max-w-[770px] mx-auto py-2">
        <div className="space-y-6">
          {/* General Form Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#2f328e] h-1.5" />
            <div className="p-6">
              <h3 className="text-xl font-medium mb-1">General Settings</h3>
              <p className="text-sm text-gray-500 mb-6">
                Core configuration for form visibility and notifications.
              </p>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Form Status</Label>
                    <p className="text-xs text-gray-500">
                      Enable or disable the form
                    </p>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={(val) => setValue("isActive", val)}
                    className="data-[state=checked]:bg-[#2f328e]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Visibility</Label>
                  <Select
                    value={visibility}
                    onValueChange={(val: FormDetails["visibility"]) =>
                      setValue("visibility", val)
                    }
                  >
                    <SelectTrigger className="focus:ring-[#2f328e]">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">PUBLIC</SelectItem>
                      <SelectItem value="PRIVATE">PRIVATE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Notification Email
                  </Label>
                  <Input
                    value={notificationEmail}
                    onChange={(e) =>
                      setValue("notificationEmail", e.target.value)
                    }
                    placeholder="support@userex.in"
                    className="focus-visible:ring-[#2f328e]"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Mobile Numbers (for OTP/Notifications)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={mobileInput}
                      onChange={(e) => setMobileInput(e.target.value)}
                      placeholder="Enter mobile number"
                      onKeyDown={(e) => e.key === "Enter" && addMobileNumber()}
                      className="focus-visible:ring-[#2f328e]"
                    />
                    <Button
                      onClick={addMobileNumber}
                      className="bg-[#2f328e] hover:bg-[#1a1c5d] text-white"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mobileNumbers.map((num: string) => (
                      <Badge
                        key={num}
                        variant="secondary"
                        className="px-2 py-1 gap-1 border-gray-200"
                      >
                        {num}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500"
                          onClick={() => removeMobileNumber(num)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Behaviour */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#2f328e] h-1.5" />
            <div className="p-6">
              <h3 className="text-xl font-medium mb-1">Form Behaviour</h3>
              <p className="text-sm text-gray-500 mb-6">
                Control how the form behaves for respondents.
              </p>
              <div className="space-y-1">
                {(
                  [
                    // { key: 'isQuiz', label: 'Quiz Mode', desc: 'Show correct/incorrect answers after submission' },
                    // { key: 'collectEmails', label: 'Collect Emails', desc: 'Require respondents to enter their email' },
                    // { key: 'limitToOneResponse', label: 'Limit to One Response', desc: 'Prevent the same user from submitting multiple times' },
                    // { key: 'allowEditing', label: 'Allow Editing After Submit', desc: 'Let respondents edit their response after submitting' },
                    {
                      key: "showProgressBar",
                      label: "Show Progress Bar",
                      desc: "Display a progress indicator at the top of the form",
                    },
                    // { key: 'shuffleQuestionOrder', label: 'Shuffle Question Order', desc: 'Randomize the order of questions for each respondent' },
                  ] as {
                    key: keyof FormSettings;
                    label: string;
                    desc: string;
                  }[]
                ).map((item, i) => (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded ${i > 0 ? "border-t border-gray-100 pt-4" : ""}`}
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.label}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      checked={(fs[item.key] as boolean) ?? false}
                      onCheckedChange={(val: boolean) =>
                        updateSetting({ [item.key]: val })
                      }
                      className="data-[state=checked]:bg-[#2f328e]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Behavior & Integrity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#2f328e] h-1.5" />
            <div className="p-6">
              <h3 className="text-xl font-medium mb-1">Behavior & Integrity</h3>
              <p className="text-sm text-gray-500 mb-6">
                Monitor and restrict suspicious behavior during form submission.
              </p>
              <div className="space-y-1">
                {(
                  [
                    {
                      key: "tabSwitchDetection",
                      label: "Tab Switch Detection",
                      desc: "Trigger warning when user switches tabs",
                      maxKey: "maxTabSwitches",
                      maxLabel: "Max switches",
                    },
                    {
                      key: "focusLossDetection",
                      label: "Window Blur / Focus Loss",
                      desc: "Detect when browser loses focus",
                      maxKey: "maxFocusLoss",
                      maxLabel: "Max losses",
                    },
                    // { key: 'fullscreenMonitoring', label: 'Fullscreen Monitoring', desc: 'Warn if respondent exits fullscreen mode', maxKey: 'maxFullscreenExits', maxLabel: 'Max exits' },
                    // { key: 'windowResizeSuspicion', label: 'Window Resize Suspicion', desc: 'Log events when browser window is resized', maxKey: null, maxLabel: null },
                    // { key: 'inactivityDetection', label: 'Inactivity Detection', desc: 'Auto-submit or warn after user is idle', maxKey: 'maxInactivityMinutes', maxLabel: 'Minutes' },
                    // { key: 'deviceChangeDetection', label: 'Device Change Detection', desc: 'Monitor for changes in hardware devices', maxKey: null, maxLabel: null },
                    // { key: 'ipChangeMonitoring', label: 'IP Change Monitoring', desc: "Log events if the respondent's IP changes", maxKey: null, maxLabel: null },
                  ] as {
                    key: keyof FormSettings;
                    label: string;
                    desc: string;
                    maxKey: keyof FormSettings | null;
                    maxLabel: string | null;
                  }[]
                ).map((item, i) => (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded ${i > 0 ? "border-t border-gray-100 pt-4" : ""}`}
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.label}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.maxKey && (fs[item.key] as boolean) && (
                        <div className="flex items-center gap-1">
                          <Label className="text-xs text-gray-400">
                            {item.maxLabel}:
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            className="w-16 h-7 text-xs text-center focus-visible:ring-[#2f328e]"
                            value={(fs[item.maxKey] as number) ?? 3}
                            onChange={(e) =>
                              updateSetting({
                                [item.maxKey!]: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                      )}
                      <Switch
                        checked={(fs[item.key] as boolean) ?? false}
                        onCheckedChange={(val: boolean) =>
                          updateSetting({ [item.key]: val })
                        }
                        className="data-[state=checked]:bg-[#2f328e]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interaction Restrictions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#2f328e] h-1.5" />
            <div className="p-6">
              <h3 className="text-xl font-medium mb-1">
                Interaction Restrictions
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Control how users interact with form content.
              </p>
              <div className="space-y-1">
                {(
                  [
                    {
                      key: "copyProtection",
                      label: "Copy Protection",
                      desc: "Prevent users from copying form content",
                    },
                    {
                      key: "pasteProtection",
                      label: "Paste Protection",
                      desc: "Prevent pasting into form fields",
                    },
                    {
                      key: "rightClickProtection",
                      label: "Right-Click Restriction",
                      desc: "Disable the right-click context menu",
                    },
                    // { key: 'screenshotProtection', label: 'Screenshot Protection', desc: 'Attempt to prevent screen capture' },
                  ] as {
                    key: keyof FormSettings;
                    label: string;
                    desc: string;
                  }[]
                ).map((item, i) => (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded ${i > 0 ? "border-t border-gray-100 pt-4" : ""}`}
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.label}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      checked={(fs[item.key] as boolean) ?? false}
                      onCheckedChange={(val: boolean) =>
                        updateSetting({ [item.key]: val })
                      }
                      className="data-[state=checked]:bg-[#2f328e]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation & Session */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#2f328e] h-1.5" />
            <div className="p-6">
              <h3 className="text-xl font-medium mb-1">Navigation & Session</h3>
              <p className="text-sm text-gray-500 mb-6">
                Restrict navigation actions during the form session.
              </p>
              <div className="space-y-1">
                {(
                  [
                    {
                      key: "pageRefreshWarning",
                      label: "Page Refresh Warning",
                      desc: "Warn user before refreshing or leaving the page",
                    },
                    // { key: 'backButtonWarning', label: 'Back Button Warning', desc: 'Intercept browser back navigation with a warning' },
                    // { key: 'singleAttemptEnforcement', label: 'Single Attempt Enforcement', desc: 'Allow only one attempt per session' },
                  ] as {
                    key: keyof FormSettings;
                    label: string;
                    desc: string;
                  }[]
                ).map((item, i) => (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded ${i > 0 ? "border-t border-gray-100 pt-4" : ""}`}
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.label}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      checked={(fs[item.key] as boolean) ?? false}
                      onCheckedChange={(val: boolean) =>
                        updateSetting({ [item.key]: val })
                      }
                      className="data-[state=checked]:bg-[#2f328e]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hardware Permissions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#2f328e] h-1.5" />
            <div className="p-6">
              <h3 className="text-xl font-medium mb-1">Hardware Permissions</h3>
              <p className="text-sm text-gray-500 mb-6">
                Request device hardware access before the form starts.
              </p>
              <div className="space-y-1">
                {(
                  [
                    {
                      key: "cameraPermissionCheck",
                      label: "Camera Permission Check",
                      desc: "Require camera access before entering the form",
                    },
                    {
                      key: "microphonePermissionAwareness",
                      label: "Microphone Permission Check",
                      desc: "Require microphone access before entering the form",
                    },
                  ] as {
                    key: keyof FormSettings;
                    label: string;
                    desc: string;
                  }[]
                ).map((item, i) => (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded ${i > 0 ? "border-t border-gray-100 pt-4" : ""}`}
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.label}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      checked={(fs[item.key] as boolean) ?? false}
                      onCheckedChange={(val: boolean) =>
                        updateSetting({ [item.key]: val })
                      }
                      className="data-[state=checked]:bg-[#2f328e]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timer Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#2f328e] h-1.5" />
            <div className="p-6">
              <h3 className="text-xl font-medium mb-1">Timer Settings</h3>
              <p className="text-sm text-gray-500 mb-6">
                Configure time limits for form submission.
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Total Form Timer</h4>
                    <p className="text-xs text-gray-500">
                      Set a countdown timer for the entire form
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {fs.totalTimerEnabled && (
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-gray-400">
                          Minutes:
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          className="w-20 h-7 text-xs text-center focus-visible:ring-[#2f328e]"
                          value={fs.totalTimerMinutes ?? 20}
                          onChange={(e) =>
                            updateSetting({
                              totalTimerMinutes: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    )}
                    <Switch
                      checked={fs.totalTimerEnabled ?? false}
                      onCheckedChange={(val) =>
                        updateSetting({ totalTimerEnabled: val })
                      }
                      className="data-[state=checked]:bg-[#2f328e]"
                    />
                  </div>
                </div>
                {(
                  [
                    // { key: 'perQuestionTimerEnabled', label: 'Per-Question Timer', desc: 'Set individual time limits per question' },
                    // { key: 'autoMoveOnTimerExpire', label: 'Auto-Move on Timer Expire', desc: 'Automatically advance when question timer runs out' },
                    // { key: 'lockPreviousAnswers', label: 'Lock Previous Answers', desc: 'Prevent going back to change already-answered questions' },
                  ] as {
                    key: keyof FormSettings;
                    label: string;
                    desc: string;
                  }[]
                ).map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border-t border-gray-100 pt-4"
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.label}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      checked={(fs[item.key] as boolean) ?? false}
                      onCheckedChange={(val: boolean) =>
                        updateSetting({ [item.key]: val })
                      }
                      className="data-[state=checked]:bg-[#2f328e]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* UX & Integrity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#2f328e] h-1.5" />
            <div className="p-6">
              <h3 className="text-xl font-medium mb-1">UX & Integrity</h3>
              <p className="text-sm text-gray-500 mb-6">
                Additional UX features and integrity enforcement tools.
              </p>
              <div className="space-y-1">
                {(
                  [
                    // { key: 'randomAttentionChecks', label: 'Random Attention Checks', desc: 'Insert verification prompts to confirm user presence' },
                    // { key: 'sectionLocking', label: 'Section Locking', desc: 'Allow access to only one section at a time' },
                    // { key: 'integrityBanner', label: 'Integrity Banner', desc: 'Show a security notice banner at the top of the form' },
                  ] as {
                    key: keyof FormSettings;
                    label: string;
                    desc: string;
                  }[]
                ).map((item, i) => (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded ${i > 0 ? "border-t border-gray-100 pt-4" : ""}`}
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.label}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      checked={(fs[item.key] as boolean) ?? false}
                      onCheckedChange={(val: boolean) =>
                        updateSetting({ [item.key]: val })
                      }
                      className="data-[state=checked]:bg-[#2f328e]"
                    />
                  </div>
                ))}
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border-t border-gray-100 pt-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">
                      Auto Screenshot Capture
                    </h4>
                    <p className="text-xs text-gray-500">
                      Periodically capture screenshots during the session via
                      screen share
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {fs.autoScreenshotCapture && (
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-gray-400">
                          Every (min):
                        </Label>
                        <Input
                          type="number"
                          min={2}
                          className="w-16 h-7 text-xs text-center focus-visible:ring-[#2f328e]"
                          value={fs.autoScreenshotIntervalMinutes ?? 2}
                          onChange={(e) =>
                            updateSetting({
                              autoScreenshotIntervalMinutes: Math.max(
                                2,
                                Number(e.target.value),
                              ),
                            })
                          }
                        />
                      </div>
                    )}
                    <Switch
                      checked={fs.autoScreenshotCapture ?? false}
                      onCheckedChange={(val) =>
                        updateSetting({ autoScreenshotCapture: val })
                      }
                      className="data-[state=checked]:bg-[#2f328e]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
