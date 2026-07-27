import ModalData from "@/components/shared/Modal/ModalData";
import { CalendarDays } from "lucide-react";

interface ConfirmSubmitPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function ConfirmSubmitPlanModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
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

      </div>
    </ModalData>
  );
}
