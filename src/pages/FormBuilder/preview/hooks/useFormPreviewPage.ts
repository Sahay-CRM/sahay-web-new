import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  useFormSendOtp,
  useFormVerifyOtp,
  useGetFormById,
  useSubmitForm,
  useUploadFormFile,
} from "@/features/api/Form";
import Urls from "@/features/utils/urls.utils";
import { useFormRestrictions } from "../../builder/hooks/useFormRestrictions";

import { decodeFormId } from "@/features/utils/id.utils";

type ResponseValue = string | string[] | File | FileList;
export type ResponseData = Record<string, ResponseValue>;

interface UploadResponse {
  fileUrl?: string;
  url?: string;
  id?: string;
}

interface UploadApiResponse {
  data: UploadResponse | UploadResponse[];
}

export const useFormPreviewPage = () => {
  const { id: rawId } = useParams<{ id: string }>();
  const id = decodeFormId(rawId || "");

  const { data: formResponse, isLoading: isLoadingForm } = useGetFormById(
    id || "",
  );
  const form = formResponse?.data as FormDetails | undefined;

  const [responses, setResponses] = useState<ResponseData>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<number>(0);
  const [hasStartedTimer, setHasStartedTimer] = useState(false);
  const [verifiedMobile, setVerifiedMobile] = useState("");
  const [verifiedName, setVerifiedName] = useState("");
  const [submissionToken, setSubmissionToken] = useState("");
  const [scoreString, setScoreString] = useState<string | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [isScreenActive, setIsScreenActive] = useState(false);
  const [screenShareError, setScreenShareError] = useState<string | null>(null);
  const [submissionReason, setSubmissionReason] = useState<{
    code: string;
    message: string;
  } | null>(null);
  const [statusSentOtp, setStatusSentOtp] = useState(false);

  // Hardware check state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hwStatus, setHwStatus] = useState({
    camera: "pending" as "pending" | "granted" | "denied",
    mic: "pending" as "pending" | "granted" | "denied",
  });
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Refs
  const displayStreamRef = useRef<MediaStream | null>(null);
  const screenshotIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const tokenRef = useRef("");
  const nameRef = useRef("");
  const mobileRef = useRef("");
  const isSubmittedRef = useRef(false);
  const wasEverScreenActiveRef = useRef(false);
  const hasRecovered = useRef(false);

  // Sync refs
  useEffect(() => {
    tokenRef.current = submissionToken;
  }, [submissionToken]);
  useEffect(() => {
    nameRef.current = verifiedName;
  }, [verifiedName]);
  useEffect(() => {
    mobileRef.current = verifiedMobile;
  }, [verifiedMobile]);

  const { mutate: sendOtp, isPending: isSendingOtp } = useFormSendOtp();
  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useFormVerifyOtp();
  const { mutate: submitForm, isPending: isSubmittingForm } = useSubmitForm();
  const { mutateAsync: uploadFormFile } = useUploadFormFile();

  const updateResponse = useCallback(
    (fieldId: string, value: ResponseValue) => {
      setResponses((prev) => ({ ...prev, [fieldId]: value }));
      setFieldErrors((prev) => {
        if (!prev[fieldId]) return prev;
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    },
    [],
  );

  // ── Screen Share ──────────────────────────────────────────────────────────
  const stopScreenShare = useCallback(() => {
    if (screenshotIntervalRef.current) {
      clearInterval(screenshotIntervalRef.current);
      screenshotIntervalRef.current = null;
    }
    if (displayStreamRef.current) {
      displayStreamRef.current.getTracks().forEach((track) => track.stop());
      displayStreamRef.current = null;
    }
    setIsScreenActive(false);
  }, []);

  const captureAndUploadScreenshot = useCallback(
    async (formId: string) => {
      if (isSubmittedRef.current) return;
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
        if (isSubmittedRef.current) return;
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
        canvas.toBlob(
          async (blob) => {
            if (!blob || isSubmittedRef.current) return;
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

  const getRules = useCallback(() => {
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
  }, [formSettings]);

  // ── handleSubmit ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (force = false, errorCode?: string, errorMessage?: string) => {
      if (!form || !id) return;

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

        // Format validation — PHONE and EMAIL (even if not required, validate when filled)
        form.fields?.forEach((field) => {
          if (errors[field.id]) return; // already has a required error
          const val = responses[field.id];
          if (!val || typeof val !== "string" || val.trim() === "") return;
          if (field.fieldType === "PHONE" && !/^[0-9]{10}$/.test(val.trim())) {
            errors[field.id] = "Enter a valid 10-digit mobile number";
          }
          if (
            field.fieldType === "EMAIL" &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
          ) {
            errors[field.id] =
              "Please enter a valid email address with @ (e.g. user@example.com)";
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
          files.forEach((f: File) => {
            const filename = f.name || `file-${Date.now()}`;
            const fileObj = new File([f], filename, { type: f.type });
            uploadData.append("file", fileObj);
          });
        });
        try {
          const response = await fetch(Urls.uploadFormImage(), {
            method: "POST",
            headers: { Authorization: `Bearer ${tokenRef.current}` },
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
          // proceed with what we have
        }
        setIsUploading(false);
      }

      const fileFieldIds = new Set(
        form.fields
          ?.filter((f: Question) => f.fieldType === "FILE")
          .map((f: Question) => f.id) || [],
      );

      Object.entries(responses).forEach(([fieldId, value]) => {
        if (value instanceof File || value instanceof FileList) return;
        if (fileFieldIds.has(fieldId)) return;
        if (typeof value === "string" || Array.isArray(value)) {
          textResponses.push({ fieldId, value: value as string | string[] });
        }
      });

      // Final screenshot on submit
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
                      mobileNumber: mobileRef.current,
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

      submitForm(
        {
          formId: id,
          mobileNumber: mobileRef.current,
          name: nameRef.current,
          responses: textResponses,
          token: tokenRef.current,
          errorCode,
          errorMessage,
        },
        {
          onSuccess: (response) => {
            isSubmittedRef.current = true;
            stopScreenShare();
            setIsSubmitted(true);
            if (response?.data?.score?.scoreString) {
              setScoreString(response.data.score.scoreString);
            }
            if (response?.message) {
              setSubmissionMessage(response.message);
            }
            if (id && mobileRef.current) {
              localStorage.removeItem(`form_session_${id}`);
              localStorage.removeItem(`form_data_${id}_${mobileRef.current}`);
              localStorage.removeItem(`form_timer_${id}_${mobileRef.current}`);
              localStorage.removeItem(
                `form_restrictions_${id}_${mobileRef.current}`,
              );
            }
          },
        },
      );
    },
    [form, id, responses, submitForm, uploadFormFile, stopScreenShare],
  );

  const onAutoSubmit = useCallback(
    (reason?: { code: string; message: string }) => {
      if (reason) setSubmissionReason(reason);
      handleSubmit(true, reason?.code, reason?.message);
    },
    [handleSubmit],
  );

  const { counts, tabSwitchWarning } = useFormRestrictions({
    formSettings,
    onAutoSubmit,
    enabled: accessGranted && !isSubmitted,
    formId: id,
    mobileNumber: verifiedMobile,
  });

  // Ref for tabSwitchDetection so track.ended handler always reads the latest value
  const tabSwitchDetectionRef = useRef(false);
  tabSwitchDetectionRef.current = !!formSettings.tabSwitchDetection;

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (
      !accessGranted ||
      !hasStartedTimer ||
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
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const remaining = totalMin * 60 - elapsedSeconds;
        if (remaining <= 0) {
          setTimeRemaining(0);
          onAutoSubmit();
        } else {
          setTimeRemaining(remaining);
        }
      } catch {
        localStorage.removeItem(timerKey);
      }
    } else {
      const totalMin = formSettings.totalTimerMinutes;
      localStorage.setItem(
        timerKey,
        JSON.stringify({ startTime: Date.now(), totalMin }),
      );
      setTimeRemaining(totalMin * 60);
    }
  }, [
    accessGranted,
    hasStartedTimer,
    formSettings.totalTimerEnabled,
    formSettings.totalTimerMinutes,
    id,
    verifiedMobile,
    onAutoSubmit,
  ]);

  useEffect(() => {
    if (
      !hasStartedTimer ||
      timeRemaining === null ||
      timeRemaining <= 0 ||
      isSubmitted
    )
      return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null) return 0;
        if (prev <= 1) {
          clearInterval(interval);
          onAutoSubmit({
            code: "TIME_LIMIT_OVER",
            message: "Time limit for the form has expired.",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStartedTimer, timeRemaining, isSubmitted, onAutoSubmit]);

  // Track wasEverScreenActive
  useEffect(() => {
    if (isScreenActive) wasEverScreenActiveRef.current = true;
  }, [isScreenActive]);

  // Monitor screen sharing integrity
  useEffect(() => {
    if (
      accessGranted &&
      !isSubmitted &&
      formSettings.autoScreenshotCapture &&
      !isScreenActive &&
      wasEverScreenActiveRef.current
    ) {
      setAccessGranted(false);
      const rules = getRules();
      let targetStep = 0;
      if (rules.length > 0) targetStep++;
      if (
        formSettings.cameraPermissionCheck ||
        formSettings.microphonePermissionAwareness
      )
        targetStep++;
      setOnboardingStep(targetStep);
    }
  }, [
    isScreenActive,
    accessGranted,
    isSubmitted,
    formSettings.autoScreenshotCapture,
    formSettings.cameraPermissionCheck,
    formSettings.microphonePermissionAwareness,
    getRules,
  ]);

  useEffect(() => {
    return () => {
      stopScreenShare();
    };
  }, [stopScreenShare]);

  // ── Start Screen Share ────────────────────────────────────────────────────
  const startScreenShare = useCallback(async () => {
    if (!id) return false;
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "monitor" },
      });
      const chosenSurface = stream
        .getVideoTracks()[0]
        ?.getSettings()?.displaySurface;
      if (chosenSurface && chosenSurface !== "monitor") {
        stream.getTracks().forEach((t) => t.stop());
        setScreenShareError(
          chosenSurface === "browser"
            ? 'You selected a Chrome Tab. Please select "Entire Screen" instead.'
            : 'You selected a Window. Please select "Entire Screen" instead.',
        );
        return false;
      }
      setScreenShareError(null);
      displayStreamRef.current = stream;

      const intervalMs =
        Math.max(2, formSettings.autoScreenshotIntervalMinutes ?? 2) *
        60 *
        1000;
      setTimeout(() => captureAndUploadScreenshot(id), 2000);
      screenshotIntervalRef.current = setInterval(
        () => captureAndUploadScreenshot(id),
        intervalMs,
      );
      setIsScreenActive(true);

      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        stopScreenShare();
      });
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Screen share error:", err);
      return false;
    }
  }, [
    id,
    formSettings.autoScreenshotIntervalMinutes,
    captureAndUploadScreenshot,
    stopScreenShare,
  ]);

  // ── OTP Form ──────────────────────────────────────────────────────────────
  const otpFormMethods = useForm<FormAccessData>({
    defaultValues: { mobile: "", userType: "", otp: "", name: "" },
  });

  const {
    register,
    handleSubmit: handleOtpSubmit,
    setValue,
    formState: { errors },
  } = otpFormMethods;

  const onOtpSubmit = async (data: FormAccessData) => {
    if (!id) return;
    if (!statusSentOtp) {
      sendOtp(
        { mobileNumber: data.mobile, name: data.name, formId: id },
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
            if (error.message?.toLowerCase().includes("already"))
              setAlreadySubmitted(true);
          },
        },
      );
    } else {
      verifyOtp(
        { mobileNumber: data.mobile, otp: data.otp || "", formId: id },
        {
          onSuccess: async (response) => {
            if (response.status) {
              setVerifiedMobile(data.mobile);
              setVerifiedName(data.name);
              setSubmissionToken(response.data?.token || "");
              setIsVerified(true);
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

  // ── Session Recovery ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || !form || hasRecovered.current) return;
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
          if (storedAccess) {
            const needsCamera = !!formSettings.cameraPermissionCheck;
            const needsMic = !!formSettings.microphonePermissionAwareness;
            const needsScreen = !!formSettings.autoScreenshotCapture;
            if (needsCamera || needsMic || needsScreen) {
              const rules = getRules();
              let targetStep = 0;
              if (rules.length > 0) targetStep++;
              if (needsCamera || needsMic) setOnboardingStep(targetStep);
              else if (needsScreen) {
                if (needsCamera || needsMic) targetStep++;
                setOnboardingStep(targetStep);
              }
              setAccessGranted(false);
            } else {
              setAccessGranted(true);
            }
            setHasStartedTimer(true);
          }
          otpFormMethods.reset({ name, mobile, otp: "", userType: "" });
        }
      } catch {
        localStorage.removeItem(sessionKey);
      }
    }
    hasRecovered.current = true;
  }, [id, form, otpFormMethods, formSettings, getRules]);

  // ── Data Persistence ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || !verifiedMobile || !isVerified) return;
    const dataKey = `form_data_${id}_${verifiedMobile}`;
    const storedData = localStorage.getItem(dataKey);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
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
  }, [id, verifiedMobile, isVerified]);

  useEffect(() => {
    if (
      !id ||
      !verifiedMobile ||
      !isVerified ||
      Object.keys(responses).length === 0
    )
      return;
    const dataKey = `form_data_${id}_${verifiedMobile}`;
    const persistentData = Object.fromEntries(
      Object.entries(responses).filter(
        ([, value]) => !(value instanceof File || value instanceof FileList),
      ),
    );
    localStorage.setItem(dataKey, JSON.stringify(persistentData));
  }, [responses, id, verifiedMobile, isVerified]);

  // ── Camera / Mic ──────────────────────────────────────────────────────────
  const requestCamera = useCallback(async () => {
    try {
      if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setHwStatus((prev) => ({ ...prev, camera: "granted" }));
      return "granted";
    } catch {
      setHwStatus((prev) => ({ ...prev, camera: "denied" }));
      return "denied";
    }
  }, [cameraStream]);

  const requestMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setHwStatus((prev) => ({ ...prev, mic: "granted" }));
      return "granted";
    } catch {
      setHwStatus((prev) => ({ ...prev, mic: "denied" }));
      return "denied";
    }
  }, []);

  useEffect(() => {
    if (cameraStream && videoRef.current)
      videoRef.current.srcObject = cameraStream;
  }, [cameraStream, hwStatus.camera]);

  useEffect(() => {
    return () => {
      if (cameraStream)
        cameraStream.getTracks().forEach((track) => track.stop());
    };
  }, [cameraStream]);

  // ── Onboarding ────────────────────────────────────────────────────────────
  const completeOnboarding = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setAccessGranted(true);
    setHasStartedTimer(true);
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
    if (formSettings.fullscreenMonitoring) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const handleAccessCheck = async () => {
    const rulesLength = getRules().length;
    const needsCamera = !!formSettings.cameraPermissionCheck;
    const needsMic = !!formSettings.microphonePermissionAwareness;
    const needsScreen = !!formSettings.autoScreenshotCapture;

    const steps = [];
    if (rulesLength > 0) steps.push("rules");
    if (needsCamera || needsMic) steps.push("hardware");
    if (needsScreen) steps.push("screen");

    const currentStepName = steps[onboardingStep];

    if (currentStepName === "rules") {
      setOnboardingStep((prev) => prev + 1);
    } else if (currentStepName === "hardware") {
      let camResult = hwStatus.camera;
      let micResult = hwStatus.mic;
      if (needsCamera && hwStatus.camera !== "granted")
        camResult = await requestCamera();
      if (needsMic && hwStatus.mic !== "granted")
        micResult = await requestMic();
      const camDone = !needsCamera || camResult === "granted";
      const micDone = !needsMic || micResult === "granted";
      if (camDone && micDone) setOnboardingStep((prev) => prev + 1);
    } else if (currentStepName === "screen") {
      const success = await startScreenShare();
      if (success) completeOnboarding();
    } else {
      completeOnboarding();
    }
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    // ids
    id,
    // form data
    form,
    formSettings,
    isLoadingForm,
    // responses
    responses,
    setResponses,
    updateResponse,
    fieldErrors,
    // state flags
    isSubmitted,
    isVerified,
    accessGranted,
    alreadySubmitted,
    isUploading,
    isSubmittingForm,
    isSendingOtp,
    isVerifyingOtp,
    // screen share
    isScreenActive,
    screenShareError,
    // timer
    timeRemaining,
    formatTime,
    scoreString,
    submissionMessage,
    // submission
    submissionReason,
    handleSubmit,
    // proctoring counts
    counts,
    tabSwitchWarning,
    // onboarding
    onboardingStep,
    handleAccessCheck,
    getRules,
    // OTP form
    statusSentOtp,
    otpFormMethods,
    register,
    handleOtpSubmit,
    setValue,
    errors,
    onOtpSubmit,
    // verified user
    verifiedName,
    verifiedMobile,
    // hardware
    videoRef,
    hwStatus,
  };
};
