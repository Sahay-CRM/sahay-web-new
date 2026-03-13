import { ShieldCheck, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormHeaderProps {
  formName: string;
  formDescription?: string;
  formSettings: FormSettings;
  timeRemaining: number | null;
  formatTime: (seconds: number | null) => string;
  tabSwitchCount: number;
  isScreenActive: boolean;
  hwStatusCamera: "pending" | "granted" | "denied";
}

const FormHeader = ({
  formName,
  formDescription,
  formSettings,
  timeRemaining,
  formatTime,
  tabSwitchCount,
  isScreenActive,
  hwStatusCamera,
}: FormHeaderProps) => {
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm">
      {/* Left: Form name + status badges */}
      <div className="flex items-center gap-2 sm:gap-6 min-w-0 overflow-hidden">
        <div className="flex flex-col min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-[#2f328e] flex items-center gap-2 truncate">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            {formName}
          </h2>
          {formDescription && (
            <p className="text-[12px] sm:text-[14px] text-gray-500 truncate">
              {formDescription}
            </p>
          )}
          <div className="flex items-center gap-2 mt-0.5">
            {tabSwitchCount > 0 && (
              <span className="text-[8px] sm:text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">
                {tabSwitchCount} TAB SWITCHES
              </span>
            )}
            {(hwStatusCamera === "granted" || isScreenActive) && (
              <span className="text-[8px] sm:text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 whitespace-nowrap">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse shrink-0" />
                SECURE SESSION ACTIVE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Timer */}
      <div className="flex items-center gap-2 shrink-0">
        {formSettings.totalTimerEnabled && (
          <div
            className={cn(
              "flex flex-col items-center justify-center min-w-[100px] sm:min-w-[150px]",
              timeRemaining !== null && timeRemaining < 60 ? "scale-100" : "",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-1.5 sm:gap-3 px-3 sm:px-6 py-1.5 sm:py-3 rounded-xl sm:rounded-2xl border-2 shadow-sm",
                timeRemaining !== null && timeRemaining < 120
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-[#2f328e]/5 border-[#2f328e]/10 text-[#2f328e]",
              )}
            >
              <Timer
                className={cn(
                  "w-4 h-4 sm:w-6 sm:h-6",
                  timeRemaining !== null && timeRemaining < 120
                    ? "text-red-500"
                    : "text-[#2f328e]",
                )}
              />
              <span className="text-xl sm:text-3xl font-black tracking-tighter tabular-nums">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <p
              className={cn(
                "text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-1",
                timeRemaining !== null && timeRemaining < 120
                  ? "text-red-500"
                  : "text-gray-400",
              )}
            >
              Time Remaining
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormHeader;
