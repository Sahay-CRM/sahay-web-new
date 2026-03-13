import { useState, useEffect, useCallback, useRef } from "react";

interface UseFormRestrictionsProps {
  formSettings: FormSettings;
  onViolation?: (violation: Violation) => void;
  onAutoSubmit?: (reason: { code: string; message: string }) => void;
  formId?: string;
  mobileNumber?: string;
}

export const useFormRestrictions = ({
  formSettings,
  onViolation,
  onAutoSubmit,
  enabled = true,
  formId,
  mobileNumber,
}: UseFormRestrictionsProps & { enabled?: boolean }) => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [tabSwitchWarning, setTabSwitchWarning] = useState(0);
  const [counts, setCounts] = useState({
    tab_switch: 0,
    focus_loss: 0,
    fullscreen_exit: 0,
    copy: 0,
    paste: 0,
    right_click: 0,
    inactivity: 0,
    camera_denied: 0,
    mic_denied: 0,
  });

  const persistenceKey =
    formId && mobileNumber
      ? `form_restrictions_${formId}_${mobileNumber}`
      : null;

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (!persistenceKey) return;
    const stored = localStorage.getItem(persistenceKey);
    if (stored) {
      try {
        const { violations: v, counts: c } = JSON.parse(stored);
        if (v) setViolations(v);
        if (c) setCounts(c);
      } catch (e) {
        console.error("Failed to parse stored restrictions", e);
      }
    }
  }, [persistenceKey]);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (
      !persistenceKey ||
      (violations.length === 0 && Object.values(counts).every((c) => c === 0))
    )
      return;
    localStorage.setItem(
      persistenceKey,
      JSON.stringify({ violations, counts }),
    );
  }, [persistenceKey, violations, counts]);

  // Keep onAutoSubmit in a ref — so it NEVER causes addViolation to recreate
  const onAutoSubmitRef = useRef(onAutoSubmit);
  onAutoSubmitRef.current = onAutoSubmit;

  const addViolation = useCallback(
    (type: Violation["type"], details?: string) => {
      if (!enabled) return;
      const newViolation: Violation = { type, timestamp: Date.now(), details };

      setViolations((prev) => [...prev, newViolation]);

      setCounts((prev) => {
        const newCount = (prev[type as keyof typeof prev] || 0) + 1;
        const s = formSettings;
        let trigger = false;
        let reason = { code: "", message: "" };

        if (type === "tab_switch" && s.tabSwitchDetection) {
          // Show warning modal on every tab switch
          setTimeout(() => setTabSwitchWarning((n) => n + 1), 0);

          if (newCount >= Number(s.maxTabSwitches)) {
            trigger = true;
            reason = {
              code: "TAB_SWITCH_LIMIT",
              message: `Form auto-submitted after ${newCount} tab switches.`,
            };
          }
        }
        if (
          type === "focus_loss" &&
          s.focusLossDetection &&
          newCount >= Number(s.maxFocusLoss)
        ) {
          trigger = true;
          reason = {
            code: "FOCUS_LOSS_LIMIT",
            message: `Form auto-submitted after losing focus ${newCount} times.`,
          };
        }
        if (
          type === "fullscreen_exit" &&
          s.fullscreenMonitoring &&
          newCount >= Number(s.maxFullscreenExits)
        ) {
          trigger = true;
          reason = {
            code: "FULLSCREEN_EXIT_LIMIT",
            message: `Form auto-submitted after exiting fullscreen ${newCount} times.`,
          };
        }
        if (type === "inactivity" && s.inactivityDetection) {
          trigger = true;
          reason = {
            code: "INACTIVITY_TIMEOUT",
            message: `Form auto-submitted due to inactivity.`,
          };
        }

        if (trigger) {
          // setTimeout takes this OUT of the state updater → safe, called exactly once
          setTimeout(() => onAutoSubmitRef.current?.(reason), 0);
        }

        return { ...prev, [type]: newCount };
      });

      onViolation?.(newViolation);
    },
    [formSettings, onViolation, enabled],
  ); // onAutoSubmit removed from deps — read from ref above

  const hasLoggedHardwareError = useRef({ camera: false, mic: false });

  const checkPermissions = useCallback(
    async (force = false) => {
      if (!enabled) return;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (force || !hasLoggedHardwareError.current.camera) {
          addViolation(
            "camera_denied",
            "Hardware access requires HTTPS or localhost (Secure Context)",
          );
          hasLoggedHardwareError.current.camera = true;
        }
        return;
      }

      if (formSettings.cameraPermissionCheck) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          stream.getTracks().forEach((track) => track.stop());
          hasLoggedHardwareError.current.camera = false;
        } catch {
          if (force || !hasLoggedHardwareError.current.camera) {
            addViolation(
              "camera_denied",
              "Camera access denied or blocked by browser",
            );
            hasLoggedHardwareError.current.camera = true;
          }
        }
      }

      if (formSettings.microphonePermissionAwareness) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          stream.getTracks().forEach((track) => track.stop());
          hasLoggedHardwareError.current.mic = false;
        } catch {
          if (force || !hasLoggedHardwareError.current.mic) {
            addViolation(
              "mic_denied",
              "Microphone access denied or blocked by browser",
            );
            hasLoggedHardwareError.current.mic = true;
          }
        }
      }
    },
    [
      formSettings.cameraPermissionCheck,
      formSettings.microphonePermissionAwareness,
      addViolation,
      enabled,
    ],
  );

  useEffect(() => {
    if (
      enabled &&
      (formSettings.cameraPermissionCheck ||
        formSettings.microphonePermissionAwareness)
    ) {
      checkPermissions();
    }
  }, [
    enabled,
    formSettings.cameraPermissionCheck,
    formSettings.microphonePermissionAwareness,
    checkPermissions,
  ]);

  useEffect(() => {
    if (!enabled) return;

    // eslint-disable-next-line no-console
    console.log(
      "[TabDetect] Listeners registered. enabled:",
      enabled,
      "| tabSwitchDetection:",
      formSettings.tabSwitchDetection,
    );

    const handleVisibilityChange = () => {
      // eslint-disable-next-line no-console
      console.log(
        "[TabDetect] visibilitychange →",
        document.visibilityState,
        "| tabSwitchDetection:",
        formSettings.tabSwitchDetection,
      );
      if (
        document.visibilityState === "hidden" &&
        formSettings.tabSwitchDetection
      ) {
        addViolation("tab_switch", "User switched tab or minimized window");
      }
    };

    const handleBlur = () => {
      if (formSettings.focusLossDetection) {
        addViolation("focus_loss", "Window lost focus");
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && formSettings.fullscreenMonitoring) {
        addViolation("fullscreen_exit", "User exited fullscreen mode");
      }
    };

    const handleResize = () => {
      if (formSettings.windowResizeSuspicion) {
        addViolation(
          "resize",
          `Window resized to ${window.innerWidth}x${window.innerHeight}`,
        );
      }
    };

    let idleTimer: ReturnType<typeof setTimeout>;
    const resetIdleTimer = () => {
      if (!formSettings.inactivityDetection) return;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(
        () => {
          addViolation(
            "inactivity",
            `User idle for ${formSettings.maxInactivityMinutes} minutes`,
          );
        },
        formSettings.maxInactivityMinutes * 60 * 1000,
      );
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formSettings.pageRefreshWarning) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("resize", handleResize);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    window.addEventListener("mousedown", resetIdleTimer);
    window.addEventListener("scroll", resetIdleTimer);

    const handleCopy = (e: ClipboardEvent) => {
      if (formSettings.copyProtection) {
        e.preventDefault();
        addViolation("copy", "Attempted to copy");
      }
    };
    const handlePaste = (e: ClipboardEvent) => {
      if (formSettings.pasteProtection) {
        e.preventDefault();
        addViolation("paste", "Attempted to paste");
      }
    };
    const handleContextMenu = (e: MouseEvent) => {
      if (formSettings.rightClickProtection) {
        e.preventDefault();
        addViolation("right_click", "Attempted right-click");
      }
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);

    resetIdleTimer();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      window.removeEventListener("mousedown", resetIdleTimer);
      window.removeEventListener("scroll", resetIdleTimer);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      clearTimeout(idleTimer);
    };
  }, [
    enabled,
    formSettings.tabSwitchDetection,
    formSettings.focusLossDetection,
    formSettings.fullscreenMonitoring,
    formSettings.windowResizeSuspicion,
    formSettings.inactivityDetection,
    formSettings.maxInactivityMinutes,
    formSettings.pageRefreshWarning,
    formSettings.copyProtection,
    formSettings.pasteProtection,
    formSettings.rightClickProtection,
    addViolation,
  ]);

  return {
    violations,
    counts,
    tabSwitchWarning,
    reCheckPermissions: checkPermissions,
  };
};
