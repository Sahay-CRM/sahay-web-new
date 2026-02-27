import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ShieldCheck,
  Timer,
  Camera,
  Mic,
  Check,
  Loader2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useFormSendOtp,
  useFormVerifyOtp,
  useGetFormById,
  useSubmitForm,
  useUploadFormFile,
} from "@/features/api/Form";
import { Form as UIForm } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Urls from "@/features/utils/urls.utils";
import { useFormRestrictions } from "../builder/hooks/useFormRestrictions";

type ResponseValue = string | string[] | File | FileList;
type ResponseData = Record<string, ResponseValue>;

interface UploadResponse {
  fileUrl?: string;
  url?: string;
  id?: string;
}

interface UploadApiResponse {
  data: UploadResponse | UploadResponse[];
}

const FormPreviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: formResponse, isLoading: isLoadingForm } = useGetFormById(
    id || "",
  );
  const form = formResponse?.data;

  const [responses, setResponses] = useState<ResponseData>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  // Store verified mobile number for use in form submission
  const [verifiedMobile, setVerifiedMobile] = useState("");
  const [verifiedName, setVerifiedName] = useState("");
  const [submissionToken, setSubmissionToken] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  // Screen-share stream held in a ref so it's accessible in intervals/async callbacks
  const displayStreamRef = useRef<MediaStream | null>(null);
  const screenshotIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const tokenRef = useRef("");

  useEffect(() => {
    tokenRef.current = submissionToken;
  }, [submissionToken]);

  const { mutate: sendOtp, isPending: isSendingOtp } = useFormSendOtp();
  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useFormVerifyOtp();
  const { mutate: submitForm, isPending: isSubmittingForm } = useSubmitForm();
  const { mutateAsync: uploadFormFile } = useUploadFormFile();

  // Timer init moved below formSettings memo — see useEffect after formSettings definition

  const updateResponse = useCallback(
    (fieldId: string, value: ResponseValue) => {
      setResponses((prev) => ({
        ...prev,
        [fieldId]: value,
      }));
      setFieldErrors((prev) => {
        if (!prev[fieldId]) return prev;
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    },
    [],
  );

  const handleSubmit = useCallback(
    async (force = false, errorCode?: string, errorMessage?: string) => {
      if (!form || !id) return;

      // ── Required field validation (skip on forced auto-submit) ──
      if (!force) {
        const errors: Record<string, string> = {};
        form.fields?.forEach((field) => {
          if (!field.isRequired) return;
          const val = responses[field.id];
          if (field.fieldType === "CHECKBOX") {
            if (!val || !Array.isArray(val) || val.length === 0) {
              errors[field.id] = `${field.label} is required`;
            }
          } else if (field.fieldType === "FILE") {
            if (!val) errors[field.id] = `${field.label} is required`;
          } else {
            if (!val || (typeof val === "string" && val.trim() === "")) {
              errors[field.id] = `${field.label} is required`;
            }
          }
        });
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          return;
        }
        setFieldErrors({});
      }

      const textResponses: { fieldId: string; value: string | string[] }[] = [];

      // Batch upload for file fields
      const fileFields = Object.entries(responses).filter(
        (item): item is [string, File | FileList] =>
          item[1] instanceof File || item[1] instanceof FileList,
      );

      if (fileFields.length > 0) {
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append("fileType", "4000");
        uploadData.append("refId", form?.id || id || "");

        fileFields.forEach(([, value]) => {
          const files = value instanceof FileList ? Array.from(value) : [value];
          files.forEach((f) => {
            const filename = f.name || `file-${Date.now()}`;
            const fileObj = new File([f], filename, { type: f.type });
            uploadData.append("file", fileObj);
          });
        });
        try {
          const response = await fetch(Urls.uploadFormImage(), {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokenRef.current}`,
            },
            body: uploadData,
          });

          const uploadRes: UploadApiResponse = await response.json();
          const results = Array.isArray(uploadRes?.data)
            ? uploadRes.data
            : [uploadRes?.data];

          let resultIdx = 0;
          fileFields.forEach(([fieldId, value]) => {
            const filesCount = value instanceof FileList ? value.length : 1;
            const fieldUrls: string[] = [];
            for (let i = 0; i < filesCount; i++) {
              const res = results[resultIdx++];
              const url = res?.fileUrl ?? res?.url ?? res?.id ?? "";
              if (url) fieldUrls.push(String(url));
            }
            if (fieldUrls.length > 0) {
              textResponses.push({
                fieldId,
                value: fieldUrls.length === 1 ? fieldUrls[0] : fieldUrls,
              });
            }
          });
        } catch {
          // If upload fails, we proceed with what we have
        }
        setIsUploading(false);
      }

      // Add non-file responses
      Object.entries(responses).forEach(([fieldId, value]) => {
        if (!(value instanceof File || value instanceof FileList)) {
          textResponses.push({ fieldId, value: value as string | string[] });
        }
      });

      // Final screenshot on submit (before sending responses)
      if (displayStreamRef.current && id) {
        try {
          const track = displayStreamRef.current.getVideoTracks()[0];
          if (track && track.readyState === "live") {
            const ImageCaptureConstructor = (
              window as unknown as {
                ImageCapture: new (track: MediaStreamTrack) => {
                  grabFrame: () => Promise<ImageBitmap>;
                };
              }
            ).ImageCapture;
            const imgCapture = new ImageCaptureConstructor(track);
            const bitmap = await imgCapture.grabFrame();
            const canvas = document.createElement("canvas");
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
            await new Promise<void>((res) =>
              canvas.toBlob(
                async (blob) => {
                  if (blob) {
                    const filename = `screenshot-submit-${Date.now()}.jpg`;
                    await uploadFormFile({
                      file: blob,
                      fileName: filename,
                      mobileNumber: verifiedMobile,
                      fileType: "4010",
                      refId: form?.id || id || "",
                      token: tokenRef.current,
                    }).catch(() => {});
                  }
                  res();
                },
                "image/jpeg",
                0.8,
              ),
            );
          }
        } catch {
          /* silent */
        }
      }

      // Step 2: Submit the form as plain JSON
      submitForm(
        {
          formId: id,
          mobileNumber: verifiedMobile,
          name: verifiedName,
          responses: textResponses,
          token: submissionToken,
          errorCode,
          errorMessage,
        },
        {
          onSuccess: () => {
            setIsSubmitted(true);
            // Clear session and data on success
            if (id && verifiedMobile) {
              localStorage.removeItem(`form_session_${id}`);
              localStorage.removeItem(`form_data_${id}_${verifiedMobile}`);
              localStorage.removeItem(`form_timer_${id}_${verifiedMobile}`);
              localStorage.removeItem(
                `form_restrictions_${id}_${verifiedMobile}`,
              );
            }
          },
        },
      );
    },
    [
      form,
      id,
      responses,
      submitForm,
      verifiedMobile,
      verifiedName,
      submissionToken,
      uploadFormFile,
    ],
  );
  // API returns formSettings as [{id, key, value}, ...] — convert to flat object
  const formSettings: FormSettings = useMemo(() => {
    const raw = form?.formSettings;
    if (!raw) return {} as FormSettings;
    if (Array.isArray(raw)) {
      const flat = (raw as { key: string; value: string }[]).reduce(
        (acc, item) => {
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
      return flat as unknown as FormSettings;
    }
    return raw as FormSettings;
  }, [form]);
  const onAutoSubmit = useCallback(
    (reason?: { code: string; message: string }) => {
      handleSubmit(true, reason?.code, reason?.message); // force=true skips required-field validation
      // Clear session on auto-submit as well
      if (id && verifiedMobile) {
        localStorage.removeItem(`form_session_${id}`);
        localStorage.removeItem(`form_data_${id}_${verifiedMobile}`);
        localStorage.removeItem(`form_timer_${id}_${verifiedMobile}`);
        localStorage.removeItem(`form_restrictions_${id}_${verifiedMobile}`);
      }
    },
    [handleSubmit, id, verifiedMobile],
  );
  // Initialize timer from properly converted formSettings and LocalStorage
  useEffect(() => {
    if (
      !accessGranted ||
      !formSettings.totalTimerEnabled ||
      !formSettings.totalTimerMinutes ||
      !id ||
      !verifiedMobile
    )
      return;

    const timerKey = `form_timer_${id}_${verifiedMobile}`;
    const stored = localStorage.getItem(timerKey);

    if (stored) {
      try {
        const { startTime, totalMin } = JSON.parse(stored);
        // If the total timer minutes changed in settings, we should probably respect the original start
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const remaining = totalMin * 60 - elapsedSeconds;

        if (remaining <= 0) {
          setTimeRemaining(0);
          // If it expired while away, we trigger auto-submit once everything is ready
          onAutoSubmit();
        } else {
          setTimeRemaining(remaining);
        }
      } catch {
        localStorage.removeItem(timerKey);
      }
    } else if (accessGranted) {
      const totalMin = formSettings.totalTimerMinutes;
      localStorage.setItem(
        timerKey,
        JSON.stringify({
          startTime: Date.now(),
          totalMin,
        }),
      );
      setTimeRemaining(totalMin * 60);
    }
  }, [
    accessGranted,
    formSettings.totalTimerEnabled,
    formSettings.totalTimerMinutes,
    id,
    verifiedMobile,
    onAutoSubmit,
  ]);

  // ── Auto Screenshot using getDisplayMedia ──────────────────────────────────
  const captureAndUploadScreenshot = useCallback(
    async (formId: string) => {
      const stream = displayStreamRef.current;
      if (!stream) return;
      try {
        const track = stream.getVideoTracks()[0];
        if (!track || track.readyState !== "live") return;
        const ImageCaptureConstructor = (
          window as unknown as {
            ImageCapture: new (track: MediaStreamTrack) => {
              grabFrame: () => Promise<ImageBitmap>;
            };
          }
        ).ImageCapture;
        const imgCapture = new ImageCaptureConstructor(track);
        const bitmap = await imgCapture.grabFrame();
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
        canvas.toBlob(
          async (blob) => {
            if (!blob) return;
            const filename = `screenshot-${Date.now()}.jpg`;
            await uploadFormFile({
              file: blob,
              fileName: filename,
              mobileNumber: verifiedMobile,
              fileType: "4010",
              refId: formId,
              token: tokenRef.current,
            }).catch(() => {});
          },
          "image/jpeg",
          0.8,
        );
      } catch {
        /* silent */
      }
    },
    [uploadFormFile, verifiedMobile],
  );

  // Start screen-share + periodic captures when form is active and feature is on
  useEffect(() => {
    if (
      !accessGranted ||
      !formSettings.autoScreenshotCapture ||
      isSubmitted ||
      !id
    )
      return;

    const intervalMs =
      Math.max(2, formSettings.autoScreenshotIntervalMinutes ?? 2) * 60 * 1000;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        displayStreamRef.current = stream;

        // Take first screenshot after a short delay (let stream stabilise)
        setTimeout(() => captureAndUploadScreenshot(id), 2000);

        // Periodic screenshots
        screenshotIntervalRef.current = setInterval(() => {
          captureAndUploadScreenshot(id);
        }, intervalMs);

        // If user stops sharing manually, cleanup
        stream.getVideoTracks()[0]?.addEventListener("ended", () => {
          if (screenshotIntervalRef.current)
            clearInterval(screenshotIntervalRef.current);
          displayStreamRef.current = null;
        });
      } catch {
        // User denied screen-share — feature silently disabled
      }
    };

    start();

    return () => {
      if (screenshotIntervalRef.current)
        clearInterval(screenshotIntervalRef.current);
      displayStreamRef.current?.getTracks().forEach((t) => t.stop());
      displayStreamRef.current = null;
    };
  }, [
    accessGranted,
    formSettings.autoScreenshotCapture,
    formSettings.autoScreenshotIntervalMinutes,
    isSubmitted,
    id,
    captureAndUploadScreenshot,
  ]);

  const [statusSentOtp, setStatusSentOtp] = useState(false);

  const otpFormMethods = useForm<FormAccessData>({
    defaultValues: {
      mobile: "",
      userType: "",
      otp: "",
      name: "",
    },
  });

  const {
    register,
    handleSubmit: handleOtpSubmit,
    setValue,
    formState: { errors },
  } = otpFormMethods;

  // ── Session Recovery ──
  const hasRecovered = useRef(false);
  useEffect(() => {
    if (!id || hasRecovered.current) return;
    const sessionKey = `form_session_${id}`;
    const stored = localStorage.getItem(sessionKey);
    if (stored) {
      try {
        const {
          token,
          name,
          mobile,
          accessGranted: storedAccess,
        } = JSON.parse(stored);
        if (token && name && mobile) {
          setSubmissionToken(token);
          setVerifiedName(name);
          setVerifiedMobile(mobile);
          setIsVerified(true);
          if (storedAccess) setAccessGranted(true);

          // Sync to OTP form methods just in case
          otpFormMethods.reset({ name, mobile, otp: "", userType: "" });
        }
      } catch {
        localStorage.removeItem(sessionKey);
      }
    }
    hasRecovered.current = true;
  }, [id, otpFormMethods]);

  // ── Data Persistence ──
  useEffect(() => {
    if (!id || !verifiedMobile || !isVerified) return;

    // 1. Hydrate data on first load after verification
    const dataKey = `form_data_${id}_${verifiedMobile}`;
    const storedData = localStorage.getItem(dataKey);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        // Only hydrate if currents responses are empty to avoid overwriting user edits
        if (
          Object.keys(responses).length === 0 &&
          Object.keys(parsed).length > 0
        ) {
          setResponses(parsed);
        }
      } catch {
        localStorage.removeItem(dataKey);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, verifiedMobile, isVerified]); // Hydrate once when verified

  useEffect(() => {
    if (
      !id ||
      !verifiedMobile ||
      !isVerified ||
      Object.keys(responses).length === 0
    )
      return;

    // 2. Persist data on every response change
    const dataKey = `form_data_${id}_${verifiedMobile}`;
    localStorage.setItem(dataKey, JSON.stringify(responses));
  }, [responses, id, verifiedMobile, isVerified]);

  const onOtpSubmit = async (data: FormAccessData) => {
    if (!id) return;
    if (!statusSentOtp) {
      sendOtp(
        {
          mobileNumber: data.mobile,
          name: data.name,
          formId: id,
        },
        {
          onSuccess: (response) => {
            if (
              response.status === false &&
              response.message?.toLowerCase().includes("already")
            ) {
              setAlreadySubmitted(true);
              return;
            }
            setStatusSentOtp(response.status);
          },
          onError: (error: Error) => {
            if (error.message?.toLowerCase().includes("already")) {
              setAlreadySubmitted(true);
            }
          },
        },
      );
    } else {
      verifyOtp(
        {
          mobileNumber: data.mobile,
          otp: data.otp || "",
          formId: id,
        },
        {
          onSuccess: async (response) => {
            if (response.status) {
              // Store name and mobile for use in submission payload
              setVerifiedMobile(data.mobile);
              setVerifiedName(data.name);
              setSubmissionToken(response.data?.token || "");
              setIsVerified(true);

              // Persist Session
              localStorage.setItem(
                `form_session_${id}`,
                JSON.stringify({
                  token: response.data?.token,
                  name: data.name,
                  mobile: data.mobile,
                }),
              );
            }
          },
        },
      );
    }
  };

  const { violations, counts } = useFormRestrictions({
    formSettings,
    onAutoSubmit,
    enabled: accessGranted && !isSubmitted,
    formId: id,
    mobileNumber: verifiedMobile,
  });

  // Hardware State for Entry Card
  const [hwStatus, setHwStatus] = useState({
    camera: "pending" as "pending" | "granted" | "denied",
    mic: "pending" as "pending" | "granted" | "denied",
  });
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      // setDevices(allDevices); // Removed unused state

      // Auto-select first available if none selected
      const videoDevices = allDevices.filter((d) => d.kind === "videoinput");
      const audioDevices = allDevices.filter((d) => d.kind === "audioinput");

      if (videoDevices.length > 0 && !selectedCamera)
        setSelectedCamera(videoDevices[0].deviceId);
      if (audioDevices.length > 0 && !selectedMic)
        setSelectedMic(audioDevices[0].deviceId);
    } catch {
      // Silently fail or handle device enumeration error
    }
  }, [selectedCamera, selectedMic]);

  const requestCamera = useCallback(async () => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
      });
      setCameraStream(stream);
      setHwStatus((prev) => ({ ...prev, camera: "granted" }));
      getDevices(); // Refresh labels
    } catch {
      setHwStatus((prev) => ({ ...prev, camera: "denied" }));
    }
  }, [selectedCamera, cameraStream, getDevices]);

  const requestMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
      });
      stream.getTracks().forEach((t) => t.stop());
      setHwStatus((prev) => ({ ...prev, mic: "granted" }));
      getDevices(); // Refresh labels
    } catch {
      setHwStatus((prev) => ({ ...prev, mic: "denied" }));
    }
  }, [selectedMic, getDevices]);

  // Initial device list check
  useEffect(() => {
    if (!accessGranted) {
      getDevices();
    }
  }, [accessGranted, getDevices]);

  // Link stream to video element once it exists
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, hwStatus.camera]);

  // Cleanup camera on unmount or access granted
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  useEffect(() => {
    if (!accessGranted || !formSettings.totalTimerEnabled || isSubmitted)
      return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [
    accessGranted,
    formSettings.totalTimerEnabled,
    isSubmitted,
    onAutoSubmit,
  ]);

  const handleAccessCheck = () => {
    // Stop camera stream before moving to form
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }

    setAccessGranted(true);
    // Persist access granted
    const sessionKey = `form_session_${id}`;
    const stored = localStorage.getItem(sessionKey);
    if (stored) {
      try {
        const session = JSON.parse(stored);
        localStorage.setItem(
          sessionKey,
          JSON.stringify({ ...session, accessGranted: true }),
        );
      } catch {
        /* silent */
      }
    }

    // Enter fullscreen for exams if enabled
    if (formSettings.fullscreenMonitoring) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const getRules = () => {
    const rules = [];
    const s = formSettings;
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoadingForm) {
    return (
      <div className="min-h-screen bg-[#f0ebf8] flex flex-col items-center justify-center p-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#2f328e] mb-4" />
        <p className="text-gray-600 font-medium">Loading form...</p>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-[#f0ebf8] flex flex-col items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-lg p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {form?.name || "Form"}
          </h1>
          {form?.description && (
            <p className="text-sm text-gray-500">{form.description}</p>
          )}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 font-medium text-sm">
              This mobile number has already submitted a response for this form.
            </p>
            <p className="text-red-600 text-xs mt-2">
              Each mobile number can only submit one response.
            </p>
          </div>
          <p className="text-[10px] text-gray-400">
            © 2026 Sahay CRM • Secure Form System
          </p>
        </div>
      </div>
    );
  }
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#f0ebf8] flex flex-col items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-lg p-10 text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {form?.name || "Form"}
          </h1>
          <div className="space-y-2">
            <p className="text-green-700 font-semibold text-lg">
              Your response has been submitted successfully!
            </p>
            <p className="text-gray-500 text-sm">
              Thank you for filling out this form. Your response has been
              recorded.
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-600 text-xs">
              You can safely close this window now. Your response cannot be
              changed after submission.
            </p>
          </div>
          <p className="text-[10px] text-gray-400">
            © 2026 Sahay CRM • Secure Form System
          </p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-[#f0ebf8] flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Form Not Found</h1>
        <p className="text-gray-600 mt-2">
          The form you are looking for does not exist or has been removed.
        </p>
      </div>
    );
  }

  if (!accessGranted) {
    const needsCamera = !!formSettings.cameraPermissionCheck;
    const needsMic = !!formSettings.microphonePermissionAwareness;
    const hwReady =
      (!needsCamera || hwStatus.camera === "granted") &&
      (!needsMic || hwStatus.mic === "granted");

    return (
      <div className="min-h-screen bg-[#f8f8fb] flex flex-col items-center justify-center p-4">
        <style>{`
                    .mirror { transform: scaleX(-1); }
                `}</style>

        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#2f328e]/10 flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-[#2f328e]" />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {isVerified ? "Hardware Check" : "Access Form"}
              </h1>
              <p className="text-gray-500 text-sm">
                {isVerified
                  ? "Please check your camera/mic to begin."
                  : `Enter your details to access ${form.name}`}
              </p>
            </div>

            <div className="w-full space-y-6">
              {!isVerified ? (
                <UIForm {...otpFormMethods}>
                  <form
                    onSubmit={handleOtpSubmit(onOtpSubmit)}
                    className="space-y-5"
                  >
                    <div className="space-y-4">
                      {/* Name Field */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                          Your Name
                        </label>
                        <input
                          placeholder="Enter your full name"
                          disabled={statusSentOtp}
                          className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#2f328e]/20 focus:border-[#2f328e] outline-none transition-all disabled:opacity-60"
                          {...register("name", {
                            required: "Please enter your name",
                          })}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-[10px] mt-1 px-1">
                            {errors.name.message as string}
                          </p>
                        )}
                      </div>

                      {/* Mobile Field */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                          Mobile Number
                        </label>
                        <div className="flex gap-2">
                          <div className="h-12 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm text-gray-500 font-medium">
                            +91
                          </div>
                          <input
                            type="tel"
                            maxLength={10}
                            placeholder="Enter number"
                            disabled={statusSentOtp}
                            className="flex-1 h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#2f328e]/20 focus:border-[#2f328e] outline-none transition-all disabled:opacity-60"
                            {...register("mobile", {
                              required: "Enter mobile number",
                              pattern: {
                                value: /^[0-9]{10}$/,
                                message: "Invalid number",
                              },
                            })}
                          />
                        </div>
                        {errors.mobile && (
                          <p className="text-red-500 text-[10px] mt-1 px-1">
                            {errors.mobile.message as string}
                          </p>
                        )}
                      </div>

                      {statusSentOtp && (
                        <div className="space-y-3 pt-2">
                          <div className="flex justify-center">
                            <InputOTP
                              maxLength={4}
                              pattern="^[0-9]+$"
                              onChange={(val) =>
                                setValue("otp", val, { shouldValidate: true })
                              }
                              className="w-full"
                            >
                              <InputOTPGroup className="flex gap-3 justify-center">
                                {[...Array(4)].map((_, i) => (
                                  <InputOTPSlot
                                    key={i}
                                    index={i}
                                    className="w-12 h-12 text-lg text-center border border-gray-200 rounded-lg focus:border-[#2f328e] focus:ring-0 outline-none bg-gray-50"
                                  />
                                ))}
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                          <input
                            type="hidden"
                            {...register("otp", { required: "Enter OTP" })}
                          />
                          {errors.otp && (
                            <p className="text-red-500 text-[10px] text-center">
                              {errors.otp.message as string}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-sm font-bold bg-[#2f328e] hover:bg-[#1e205e] text-white rounded-xl shadow-lg shadow-[#2f328e]/10 transition-all flex items-center justify-center gap-2"
                      disabled={
                        (!statusSentOtp && isSendingOtp) ||
                        (statusSentOtp && isVerifyingOtp)
                      }
                    >
                      {((!statusSentOtp && isSendingOtp) ||
                        (statusSentOtp && isVerifyingOtp)) && (
                        <Loader2 className="animate-spin h-4 w-4" />
                      )}
                      {statusSentOtp ? "Verify & Enter" : "Send OTP"}
                    </Button>
                  </form>
                </UIForm>
              ) : (
                <div className="space-y-6">
                  {needsCamera || needsMic ? (
                    <div className="space-y-4">
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
                                Camera Request
                              </p>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={requestCamera}
                                className="text-[#2f328e] text-[10px]"
                              >
                                Allow Camera
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        {needsCamera && (
                          <Button
                            variant={
                              hwStatus.camera === "granted"
                                ? "outline"
                                : "default"
                            }
                            onClick={requestCamera}
                            className="h-10 text-[11px] rounded-lg"
                          >
                            <Camera className="w-3.5 h-3.5 mr-2" />
                            {hwStatus.camera === "granted"
                              ? "Rescan"
                              : "Allow Camera"}
                          </Button>
                        )}
                        {needsMic && (
                          <Button
                            variant={
                              hwStatus.mic === "granted" ? "outline" : "default"
                            }
                            onClick={requestMic}
                            className="h-10 text-[11px] rounded-lg"
                          >
                            <Mic className="w-3.5 h-3.5 mr-2" />
                            {hwStatus.mic === "granted"
                              ? "Active"
                              : "Allow Mic"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center">
                      <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-green-700 text-sm font-medium">
                        Ready to start
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleAccessCheck}
                    disabled={!hwReady}
                    className="w-full h-14 text-sm font-bold bg-[#2f328e] hover:bg-[#1e205e] text-white rounded-xl shadow-lg transition-all"
                  >
                    Proceed to Form
                  </Button>
                </div>
              )}
            </div>
          </div>
          <p className="text-center mt-8 text-[10px] text-gray-400 uppercase tracking-widest">
            © 2026 Sahay CRM • Secure Session
          </p>
        </div>
      </div>
    );
  }

  if (timeRemaining <= 0 && formSettings.totalTimerEnabled && accessGranted) {
    return (
      <div className="min-h-screen bg-[#f0ebf8] flex flex-col items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-lg p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <Timer className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Time Limit Over!</h1>
          <p className="text-gray-600">
            The time allocated for this form has expired. Your responses have
            been automatically submitted.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 font-medium text-sm">Session Closed</p>
          </div>
          <p className="text-[10px] text-gray-400">
            © 2026 Sahay CRM • Secure Form System
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#f8f9fc] flex flex-col overflow-hidden">
      {/* Header / Integrity Banner */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-[#2f328e] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              SECURE SESSION
            </h2>
            <div className="flex items-center gap-3 mt-1">
              {counts.tab_switch > 0 && (
                <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">
                  {counts.tab_switch} TAB SWITCHES
                </span>
              )}
              {hwStatus.camera === "granted" ? (
                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />{" "}
                  CAMERA ACTIVE
                </span>
              ) : (
                formSettings.cameraPermissionCheck && (
                  <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold">
                    CAMERA BLOCKED
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Big Prominent Timer */}
        {formSettings.totalTimerEnabled && (
          <div
            className={cn(
              "flex flex-col items-center justify-center min-w-[150px] transition-all duration-300",
              timeRemaining < 60 ? "scale-110" : "",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all duration-500 shadow-sm",
                timeRemaining < 120
                  ? "bg-red-50 border-red-200 text-red-600 animate-pulse"
                  : "bg-[#2f328e]/5 border-[#2f328e]/10 text-[#2f328e]",
              )}
            >
              <Timer
                className={cn(
                  "w-6 h-6",
                  timeRemaining < 120 ? "text-red-500" : "text-[#2f328e]",
                )}
              />
              <span className="text-3xl font-black tracking-tighter tabular-nums">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <p
              className={cn(
                "text-[9px] font-black uppercase tracking-[0.2em] mt-1.5",
                timeRemaining < 120 ? "text-red-500" : "text-gray-400",
              )}
            >
              Time Remaining
            </p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs rounded-xl"
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? "Hide Audit" : "Audit Logs"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-red-500 hover:bg-red-50 rounded-xl"
            onClick={() =>
              window.confirm(
                "Are you sure you want to exit? Your progress will be saved.",
              ) && window.close()
            }
          >
            {/* Exit icon or text */}
            <AlertCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Rules & User Sidebar (Strictly Fixed) */}
        <div className="w-[280px] bg-white border-r border-gray-200 hidden lg:flex flex-col p-4 space-y-5 shadow-[1px_0_5px_rgba(0,0,0,0.02)] overflow-hidden shrink-0">
          {/* User Profile */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Candidate Profile
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2f328e] text-white flex items-center justify-center font-bold text-base">
                {verifiedName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-gray-800 truncate">
                  {verifiedName}
                </p>
                <p className="text-[9px] text-gray-500 font-medium">
                  +91 {verifiedMobile}
                </p>
              </div>
            </div>
          </div>

          {/* Proctored Rules */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Session Rules
              </h3>
              <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                <Check className="w-2.5 h-2.5 text-green-600" />
                <span className="text-[9px] text-green-600 font-bold uppercase">
                  Active
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 space-y-2">
                {getRules().map((rule, i) => (
                  <div key={i} className="flex items-start gap-2.5 group">
                    <div className="mt-1 w-1 h-1 rounded-full bg-[#2f328e]/30 group-hover:bg-[#2f328e] transition-colors" />
                    <p className="text-[10px] text-gray-600 font-medium leading-tight">
                      {rule}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-orange-600 bg-orange-50 p-2.5 rounded-lg border border-orange-100 font-medium leading-relaxed">
                <b>Warning:</b> Any violation will result in auto-submission.
              </p>
            </div>
          </div>

          {/* Progress Stats */}
          {formSettings.showProgressBar && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Total Progress
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-gray-500">Completion</span>
                  <span className="text-[#2f328e]">
                    {Math.round(
                      (Object.keys(responses).length /
                        (form.fields?.length || 1)) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2f328e] transition-all duration-500"
                    style={{
                      width: `${(Object.keys(responses).length / (form.fields?.length || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Content (Only this scrolls) */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-3 lg:p-5">
          <div className="max-w-[800px] mx-auto space-y-8 pb-20">
            {/* Violations Warning Bar */}
            {counts.tab_switch > 0 &&
              counts.tab_switch < (formSettings.maxTabSwitches || 0) && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top duration-500">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-red-700">
                      Warning: Tab Switch Detected
                    </p>
                    <p className="text-[11px] text-red-600 font-medium">
                      You have switched tabs {counts.tab_switch} times. The form
                      will auto-submit after {formSettings.maxTabSwitches || 0}{" "}
                      switches.
                    </p>
                  </div>
                </div>
              )}

            {/* Title Card */}
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <h1 className="text-lg font-semibold text-black">{form.name}</h1>
              {form.description && (
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                  {form.description}
                </p>
              )}
            </div>

            {/* Questions */}
            <div className="space-y-2">
              {(form.fields || []).map((question) => {
                const options: string[] = (() => {
                  const raw = question.options as unknown;
                  if (typeof raw === "string")
                    return (raw as string)
                      .split(",")
                      .map((o) => o.trim())
                      .filter(Boolean);
                  if (Array.isArray(raw))
                    return (raw as Option[]).map((o) => o.text).filter(Boolean);
                  return [];
                })();

                return (
                  <div
                    key={question.id}
                    className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm"
                  >
                    <div className="text-xs font-semibold text-gray-850 mb-2 flex gap-1 leading-tight">
                      {question.label}
                      {question.isRequired && (
                        <span className="text-red-500 font-bold">*</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {(question.fieldType === "RADIO" ||
                        question.fieldType === "CHECKBOX" ||
                        question.fieldType === "SELECT") && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                          {options.map((opt, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                if (question.fieldType === "CHECKBOX") {
                                  const current =
                                    (responses[question.id] as string[]) || [];
                                  const next = current.includes(opt)
                                    ? current.filter((v) => v !== opt)
                                    : [...current, opt];
                                  updateResponse(question.id, next);
                                } else {
                                  updateResponse(question.id, opt);
                                }
                              }}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-md border transition-all cursor-pointer",
                                (
                                  question.fieldType === "CHECKBOX"
                                    ? (
                                        (responses[question.id] as string[]) ||
                                        []
                                      ).includes(opt)
                                    : responses[question.id] === opt
                                )
                                  ? "border-[#2f328e] bg-[#2f328e]/5"
                                  : "border-gray-200 bg-white hover:border-gray-300",
                              )}
                            >
                              <div
                                className={cn(
                                  "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                                  (
                                    question.fieldType === "CHECKBOX"
                                      ? (
                                          (responses[
                                            question.id
                                          ] as string[]) || []
                                        ).includes(opt)
                                      : responses[question.id] === opt
                                  )
                                    ? "border-[#2f328e] bg-[#2f328e]"
                                    : "border-gray-300 bg-white",
                                )}
                              >
                                {(question.fieldType === "CHECKBOX"
                                  ? (
                                      (responses[question.id] as string[]) || []
                                    ).includes(opt)
                                  : responses[question.id] === opt) && (
                                  <Check className="w-2.5 h-2.5 text-white stroke-[4px]" />
                                )}
                              </div>
                              <span className="text-sm text-gray-600">
                                {opt}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {(question.fieldType === "TEXT" ||
                        question.fieldType === "EMAIL" ||
                        question.fieldType === "PHONE" ||
                        question.fieldType === "NUMBER") && (
                        <input
                          type={question.fieldType.toLowerCase()}
                          placeholder={
                            question.placeholder ||
                            "Enter your response here..."
                          }
                          value={
                            (responses[question.id] as unknown as string) || ""
                          }
                          onChange={(e) =>
                            updateResponse(question.id, e.target.value)
                          }
                          className="w-full h-8 bg-white border border-gray-200 rounded-lg px-3 text-sm focus:ring-1 focus:ring-[#2f328e] outline-none transition-all"
                        />
                      )}

                      {question.fieldType === "TEXTAREA" && (
                        <textarea
                          placeholder={
                            question.placeholder ||
                            "Enter your long response here..."
                          }
                          value={
                            (responses[question.id] as unknown as string) || ""
                          }
                          onChange={(e) =>
                            updateResponse(question.id, e.target.value)
                          }
                          className="w-full min-h-[80px] bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#2f328e] outline-none transition-all"
                        />
                      )}

                      {question.fieldType === "DATE" && (
                        <input
                          type="date"
                          value={
                            (responses[question.id] as unknown as string) || ""
                          }
                          onChange={(e) =>
                            updateResponse(question.id, e.target.value)
                          }
                          className="w-full h-8 bg-white border border-gray-200 rounded-lg px-3 text-sm focus:ring-1 focus:ring-[#2f328e] outline-none transition-all"
                        />
                      )}

                      {question.fieldType === "FILE" && (
                        <div
                          onClick={() =>
                            document
                              .getElementById(`file-${question.id}`)
                              ?.click()
                          }
                          className="w-full py-4 px-4 border border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-50 transition-all group"
                        >
                          <input
                            type="file"
                            id={`file-${question.id}`}
                            className="hidden"
                            onChange={(e) =>
                              e.target.files?.[0] &&
                              updateResponse(question.id, e.target.files[0])
                            }
                          />
                          <Upload className="w-4 h-4 text-gray-400" />
                          <p className="text-xs text-gray-600">
                            {responses[question.id]
                              ? (responses[question.id] as File).name
                              : "Upload document"}
                          </p>
                          <p className="text-[9px] text-gray-400">
                            PDF, JPG or PNG (Max 5MB)
                          </p>
                        </div>
                      )}
                    </div>

                    {fieldErrors[question.id] && (
                      <p className="text-[10px] text-red-500 mt-3 flex items-center gap-1.5 font-bold animate-in fade-in">
                        <AlertCircle className="w-3 h-3" />{" "}
                        {fieldErrors[question.id]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Footer */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-center sm:text-left">
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                  Ready to finish?
                </p>
                <p className="text-[11px] text-gray-500">
                  Review answers before submitting.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  className="h-9 px-3 text-xs text-gray-500 hover:text-red-500"
                  onClick={() =>
                    window.confirm("Clear all responses?") && setResponses({})
                  }
                >
                  Clear Form
                </Button>
                <Button
                  className="h-9 px-5 text-sm bg-[#2f328e] hover:bg-[#1a1c5d] text-white rounded-lg shadow-sm"
                  onClick={() => handleSubmit()}
                  disabled={isUploading || isSubmittingForm}
                >
                  {isUploading || isSubmittingForm ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    "Submit Response"
                  )}
                </Button>
              </div>
            </div>

            <p className="text-center text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">
              © 2026 Sahay CRM Integrated proctoring System
            </p>
          </div>
        </div>
      </div>

      {/* Audit Sidebar (Hidden by default) */}
      {showDebug && (
        <div className="fixed top-0 right-0 w-[400px] h-full bg-slate-900 z-[100] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 p-8">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#556ee6]" />
                Audit Navigator
              </h2>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">
                Live Security Feed
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setShowDebug(false)}
            >
              <AlertCircle className="w-6 h-6 rotate-45" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-8 scrollbar-hide">
            {/* Summary Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-3xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                  Stability
                </p>
                <p className="text-2xl font-black text-white">
                  {100 - counts.tab_switch * 5}%
                </p>
              </div>
              <div className="p-4 rounded-3xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                  Violations
                </p>
                <p className="text-2xl font-black text-red-500">
                  {violations.length}
                </p>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-[#556ee6] uppercase tracking-widest px-1">
                Incident reports
              </h3>
              <div className="space-y-3">
                {violations.length === 0 ? (
                  <div className="p-6 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center">
                    <Check className="w-6 h-6 text-green-500 mx-auto mb-2 opacity-20" />
                    <p className="text-[11px] text-gray-500 font-medium italic">
                      All systems clear. No incidents reported.
                    </p>
                  </div>
                ) : (
                  [...violations].reverse().map((v, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-black/40 border border-white/5 border-l-4 border-l-red-500 space-y-1"
                    >
                      <div className="flex justify-between items-center text-[9px] font-black">
                        <span className="text-red-400 uppercase tracking-tighter">
                          {v.type.replace("_", " ")}
                        </span>
                        <span className="text-gray-500 font-sans tabular-nums">
                          {new Date(v.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-tight font-medium">
                        {v.details}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 mt-auto">
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl border-white/10 text-white font-bold text-xs hover:bg-white/5"
              onClick={() => window.print()}
            >
              Export Audit log
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormPreviewPage;
