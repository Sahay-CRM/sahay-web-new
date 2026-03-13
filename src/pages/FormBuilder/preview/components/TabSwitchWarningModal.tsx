import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface TabSwitchWarningModalProps {
  count: number;
  maxSwitches: number;
  onClose: () => void;
}

const TabSwitchWarningModal = ({
  count,
  maxSwitches,
  onClose,
}: TabSwitchWarningModalProps) => {
  const remaining = maxSwitches - count;

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pointer-events-none">
      {/* Backdrop flash */}
      <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />

      <div
        className="pointer-events-auto mt-20 mx-4 max-w-md w-full bg-white rounded-2xl shadow-2xl border-2 border-red-400 overflow-hidden"
        style={{ animation: "slideDown 0.3s ease-out" }}
      >
        {/* Top colored bar */}
        <div className="bg-red-500 h-1.5" />

        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900">
                Tab Switch Detected!
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                You switched away from this form.{" "}
                <span className="font-semibold text-red-600">
                  {count} of {maxSwitches}
                </span>{" "}
                allowed switches used.
              </p>

              {remaining > 0 ? (
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ Only{" "}
                  <span className="font-bold text-orange-500">
                    {remaining} more switch{remaining !== 1 ? "es" : ""}
                  </span>{" "}
                  allowed before the form is auto-submitted.
                </p>
              ) : (
                <p className="text-xs text-red-600 font-semibold mt-2">
                  🚨 Limit reached — form will be auto-submitted!
                </p>
              )}

              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (count / maxSwitches) * 100)}%`,
                    background:
                      remaining <= 1
                        ? "#ef4444"
                        : remaining <= 2
                          ? "#f97316"
                          : "#eab308",
                  }}
                />
              </div>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Auto-dismiss countdown bar */}
        <div className="h-0.5 bg-gray-100 relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-red-300"
            style={{ animation: "shrink 5s linear forwards" }}
          />
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default TabSwitchWarningModal;
