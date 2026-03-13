import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useGetForm, useUpdateForm } from "@/features/api/Form";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
import PageNotAccess from "../../PageNoAccess";
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
import { X, Loader2, FileText, Send, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

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
  // const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { data: formData, isLoading } = useGetForm(id || "");
  const { mutate: updateForm, isPending: isUpdating } = useUpdateForm();

  const [mobileInput, setMobileInput] = useState("");
  const [mobileNumbers, setMobileNumbers] = useState<string[]>([]);
  const [mobileSearch, setMobileSearch] = useState("");
  const [csvImportMsg, setCsvImportMsg] = useState<{
    text: string;
    ok: boolean;
  } | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
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
      { label: `${formName} Form Settings`, href: "" },
    ]);
  }, [setBreadcrumbs, formName]);

  const permission = useSelector(getUserPermission).FORM;

  if (permission && permission.View === false) {
    return <PageNotAccess />;
  }

  const updateSetting = (updates: Partial<FormSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const addMobileNumber = () => {
    if (mobileInput && !mobileNumbers.includes(mobileInput)) {
      setMobileNumbers((prev) => [...prev, mobileInput]);
      setMobileInput("");
    }
  };

  const removeMobileNumber = (index: number) => {
    setMobileNumbers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!csvInputRef.current) return;
    csvInputRef.current.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (!text) return;

      // Flatten all cells across rows, trim whitespace
      const cells = text
        .split(/\r?\n/)
        .flatMap((row) => row.split(","))
        .map((cell) => cell.replace(/["'\s]/g, ""))
        .filter(Boolean);

      // Accept any numeric string (allows country-prefixed numbers too)
      // 1) deduplicate within the CSV itself
      // 2) exclude numbers already in the list
      const valid = [...new Set(cells.filter((c) => /^[0-9+]{7,15}$/.test(c)))];
      const unique = valid.filter((n) => !mobileNumbers.includes(n));

      if (unique.length === 0) {
        setCsvImportMsg({ text: "No new numbers found in CSV.", ok: false });
      } else {
        setMobileNumbers((prev) => [...prev, ...unique]);
        setCsvImportMsg({
          text: `${unique.length} number(s) imported.`,
          ok: true,
        });
      }
      setTimeout(() => setCsvImportMsg(null), 3000);
    };
    reader.readAsText(file);
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
        expireDate: watch("expireDate"),
        formSettings: settings,
      } as Partial<FormDetails>,
    });
  };

  const onToggleActive = () => {
    if (!id) return;
    const newActive = !isActive;
    setValue("isActive", newActive);
    updateForm({
      id,
      data: {
        name: formName,
        isActive: newActive,
        visibility,
        notificationEmail,
        mobileNumbers,
        expireDate: watch("expireDate"),
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
          {/* <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-500"
            onClick={() => navigate(`/dashboard/form-builder?id=${id}`)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button> */}
          <div>
            <h1 className="font-semibold text-xl text-black">
              {/* {formName || "Form"} */}
              Settings
            </h1>
            {/* <p className="text-xs text-gray-500">Settings</p> */}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className={cn(
              "px-5 h-8 shadow-sm transition-all flex items-center gap-2",
              isActive
                ? "bg-white text-[#2f328e] border border-[#2f328e]/20 hover:bg-[#2f328e]/5"
                : "bg-[#2f328e] hover:bg-[#1a1c5d] text-white",
            )}
            onClick={onToggleActive}
          >
            {isActive ? (
              <>
                <FileText className="h-4 w-4" />
                Draft
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Published
              </>
            )}
          </Button>

          <Button
            onClick={handleSave}
            className="bg-[#2f328e] hover:bg-[#1a1c5d] text-white h-8"
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Save Settings"}
          </Button>
        </div>
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
                {/* <div className="flex items-center justify-between"> */}
                {/* <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Form Status</Label>
                    <p className="text-xs text-gray-500">
                      Enable or disable the form
                    </p>
                  </div> */}
                {/* <Button
                    size="sm"
                    className={cn(
                      "px-5 h-8 shadow-sm transition-all flex items-center gap-2",
                      isActive
                        ? "bg-white text-[#2f328e] border border-[#2f328e]/20 hover:bg-[#2f328e]/5"
                        : "bg-[#2f328e] hover:bg-[#1a1c5d] text-white",
                    )}
                    onClick={onToggleActive}
                  >
                    {isActive ? (
                      <>
                        <FileText className="h-4 w-4" />
                        Draft
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Published
                      </>
                    )}
                  </Button> */}
                {/* </div> */}
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
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Expiry Date</Label>
                  <input
                    type="date"
                    value={
                      watch("expireDate")
                        ? watch("expireDate")?.split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      setValue(
                        "expireDate",
                        val ? new Date(val).toISOString() : undefined,
                      );
                    }}
                    min={(() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      return tomorrow.toISOString().split("T")[0];
                    })()}
                    className="w-full h-9 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#2f328e] focus:border-[#2f328e]"
                  />
                </div>
                {visibility !== "PUBLIC" && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Mobile Numbers (for OTP/Notifications)
                    </Label>
                    {/* Input row */}
                    <div className="flex gap-2">
                      <Input
                        value={mobileInput}
                        onChange={(e) => setMobileInput(e.target.value)}
                        placeholder="Enter mobile number"
                        onKeyDown={(e) =>
                          e.key === "Enter" && addMobileNumber()
                        }
                        className="focus-visible:ring-[#2f328e]"
                      />
                      <Button
                        onClick={addMobileNumber}
                        className="bg-[#2f328e] hover:bg-[#1a1c5d] text-white shrink-0"
                      >
                        Add
                      </Button>
                      <input
                        ref={csvInputRef}
                        type="file"
                        accept=".csv,text/csv"
                        className="hidden"
                        onChange={handleCsvImport}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-[#2f328e]/30 text-[#2f328e] hover:bg-[#2f328e]/5 flex items-center gap-1.5 shrink-0"
                        onClick={() => csvInputRef.current?.click()}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Import CSV
                      </Button>
                    </div>

                    {csvImportMsg && (
                      <p
                        className={`text-xs font-medium ${csvImportMsg.ok ? "text-green-600" : "text-red-500"}`}
                      >
                        {csvImportMsg.ok ? "✓" : "✗"} {csvImportMsg.text}
                      </p>
                    )}

                    {/* Number list */}
                    {mobileNumbers.length > 0 && (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* List header: search + count + clear */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                          <input
                            type="text"
                            value={mobileSearch}
                            onChange={(e) => setMobileSearch(e.target.value)}
                            placeholder="Search numbers…"
                            className="flex-1 text-xs bg-transparent outline-none placeholder-gray-400 text-gray-700"
                          />
                          <span className="text-[10px] font-semibold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full shrink-0">
                            {mobileNumbers.length} total
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setMobileNumbers([]);
                              setMobileSearch("");
                            }}
                            className="text-[10px] font-semibold text-red-400 hover:text-red-600 transition-colors shrink-0"
                          >
                            Clear all
                          </button>
                        </div>

                        {/* Scrollable rows */}
                        <div
                          className="overflow-y-auto"
                          style={{ maxHeight: 220 }}
                        >
                          {mobileNumbers
                            .map((num, originalIdx) => ({ num, originalIdx }))
                            .filter(
                              ({ num }) =>
                                mobileSearch.trim() === "" ||
                                num.includes(mobileSearch.trim()),
                            )
                            .map(({ num, originalIdx }) => (
                              <div
                                key={originalIdx}
                                className="flex items-center justify-between px-3 py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                              >
                                <span className="text-[13px] font-mono font-medium text-gray-700">
                                  {num}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeMobileNumber(originalIdx)
                                  }
                                  className="text-gray-300 hover:text-red-500 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          {mobileNumbers.filter(
                            (num) =>
                              mobileSearch.trim() === "" ||
                              num.includes(mobileSearch.trim()),
                          ).length === 0 && (
                            <p className="text-center text-xs text-gray-400 py-4">
                              No numbers match your search.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                    // {
                    //   key: "focusLossDetection",
                    //   label: "Window Blur / Focus Loss",
                    //   desc: "Detect when browser loses focus",
                    //   maxKey: "maxFocusLoss",
                    //   maxLabel: "Max losses",
                    // },
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
                        onCheckedChange={(val: boolean) => {
                          const updates: Record<string, unknown> = {
                            [item.key]: val,
                          };
                          // If enabling and maxKey exists but has no value, set default
                          if (
                            val &&
                            item.maxKey &&
                            fs[item.maxKey] === undefined
                          ) {
                            updates[item.maxKey as string] = 3;
                          }
                          updateSetting(updates as Partial<FormSettings>);
                        }}
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
                      onCheckedChange={(val) => {
                        const updates: Partial<FormSettings> = {
                          totalTimerEnabled: val,
                        };
                        if (val && fs.totalTimerMinutes === undefined) {
                          updates.totalTimerMinutes = 20;
                        }
                        updateSetting(updates);
                      }}
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
                      onCheckedChange={(val) => {
                        const updates: Partial<FormSettings> = {
                          autoScreenshotCapture: val,
                        };
                        if (
                          val &&
                          fs.autoScreenshotIntervalMinutes === undefined
                        ) {
                          updates.autoScreenshotIntervalMinutes = 2;
                        }
                        updateSetting(updates);
                      }}
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
