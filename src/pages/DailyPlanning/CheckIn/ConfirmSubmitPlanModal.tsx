import ModalData from "@/components/shared/Modal/ModalData";
import { CalendarDays, AlertTriangle, Info } from "lucide-react";

interface ConfirmSubmitPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  isOvertime?: boolean;
  plannedMinutes?: number;
  remainingMinutes?: number;
}

const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours} hr${hours > 1 ? "s" : ""}${mins > 0 ? ` ${mins} min${mins > 1 ? "s" : ""}` : ""}`;
  }
  return `${minutes} min${minutes > 1 ? "s" : ""}`;
};

export default function ConfirmSubmitPlanModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  isOvertime,
  plannedMinutes = 0,
  remainingMinutes = 0,
}: ConfirmSubmitPlanModalProps) {
  return (
    <ModalData
      isModalOpen={open}
      modalTitle="Submit Daily Plan"
      modalClose={() => onOpenChange(false)}
      containerClass="max-w-md !min-h-0"
      buttons={[
        {
          btnText: "Cancel",
          buttonCss:
            "py-1.5 px-5 bg-transparent text-slate-700 border hover:bg-slate-50",
          btnClick: () => onOpenChange(false),
        },
        {
          btnText: "Submit Plan",
          buttonCss:
            "py-1.5 px-5 bg-emerald-600 text-white hover:bg-emerald-700 border-none",
          btnClick: onConfirm,
          isLoading: isLoading,
        },
      ]}
    >
      <div className="flex flex-col items-center text-center p-2">
        {/* Glow Icon */}
        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
          <CalendarDays className="h-7 w-7 text-emerald-600" />
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1.5">
          Ready to submit today's plan?
        </h3>

        <p className="text-sm text-slate-500 mb-4 max-w-xs leading-relaxed">
          This will submit your planned items and finalize your schedule for today.
        </p>

        {isOvertime && (
          <div className="w-full mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800 flex items-start gap-2 text-left shadow-2xs">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Overtime Warning:</strong> You are planning overtime. Today's planned time exceeds the company's working hours.
            </span>
          </div>
        )}

        {remainingMinutes > 0 && (
          <div className="w-full mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800 flex items-start gap-2 text-left shadow-2xs">
            <Info className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Remaining Time:</strong> You have planned only <strong>{formatMinutes(plannedMinutes)}</strong> out of your company working hours, and <strong>{formatMinutes(remainingMinutes)}</strong> are still remaining. Are you sure you don't want to plan this remaining time?
            </span>
          </div>
        )}
      </div>
    </ModalData>
  );
}
