import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import ModalData from "@/components/shared/Modal/ModalData";
import useAddEditCheckInModal from "./useAddEditCheckInModal";

interface AddEditCheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialItem?: DailyPlanItem | null;
  onAddTaskClick?: () => void;
  onAddMeetingClick?: () => void;
  items: DailyPlanItem[];
  companyWorkingMinutes: number;
  date?: string;
}

export default function AddEditCheckInModal({
  open,
  onOpenChange,
  initialItem,
  items,
  companyWorkingMinutes,
  date,
}: AddEditCheckInModalProps) {
  const {
    title,
    estimatedHours,
    setEstimatedHours,
    estimatedMinutes,
    setEstimatedMinutes,
    errors,
    setErrors,
    handleSubmit,
    handleModalClose,
    isPending,
    isInputOvertime,
  } = useAddEditCheckInModal({
    open,
    onOpenChange,
    initialItem,
    items,
    companyWorkingMinutes,
    date,
  });

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length > 2) {
      val = val.slice(0, 2);
    }
    const numVal = Number(val) || 0;
    if (numVal > 12) {
      setEstimatedHours("12");
    } else {
      setEstimatedHours(val);
    }
    setErrors((prev) => ({ ...prev, estimatedTime: undefined }));
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length > 2) {
      val = val.slice(0, 2);
    }
    const numVal = Number(val) || 0;
    if (numVal > 59) {
      setEstimatedMinutes("59");
    } else {
      setEstimatedMinutes(val);
    }
    setErrors((prev) => ({ ...prev, estimatedTime: undefined }));
  };

  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <ModalData
      isModalOpen={open}
      modalTitle={title || (initialItem ? "Edit Planning Item" : "Add Planning Item")}
      modalClose={handleModalClose}
      buttons={[
        {
          btnText: "Cancel",
          buttonCss:
            "py-1.5 px-5 bg-transparent text-slate-700 border hover:bg-slate-50",
          btnClick: handleModalClose,
        },
        {
          btnText: initialItem ? "Update" : "Submit",
          buttonCss: "py-1.5 px-5",
          btnClick: handleSubmit,
          isLoading: isPending,
        },
      ]}
    >
      <div className="space-y-6 py-2">
        {/* Helper Message */}
        <p className="text-slate-500 text-sm leading-relaxed">
          Specify the estimated duration required to complete this task today.
        </p>

        {/* Custom Hour/Minute Input Group */}
        <div className="flex flex-col items-center justify-center p-6  rounded-2xl">
          <div className="flex items-center gap-4">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  id="estimatedHours"
                  min={0}
                  value={estimatedHours}
                  onChange={handleHoursChange}
                  className="w-15 text-center text-2xl font-extrabold text-slate-800 bg-transparent border-b-2 border-slate-300 focus:border-primary focus:outline-none pb-1 transition-all placeholder:text-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                />
                <span className="text-slate-500 font-semibold text-lg">hr</span>
              </div>
            </div>

            {/* Separator */}
            <span className="text-slate-300 text-2xl font-light pb-2">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  id="estimatedMinutes"
                  min={0}
                  max={59}
                  value={estimatedMinutes}
                  onChange={handleMinutesChange}
                  className="w-15 text-center text-2xl font-extrabold text-slate-800 bg-transparent border-b-2 border-slate-300 focus:border-primary focus:outline-none pb-1 transition-all placeholder:text-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="00"
                />
                <span className="text-slate-500 font-semibold text-lg">min</span>
              </div>
            </div>
          </div>

          {/* Validation error display */}
          {errors.estimatedTime && (
            <div className="text-rose-600 text-sm  flex items-center gap-1.5 mt-4">
              <AlertTriangle className="h-4 w-4" />
              <span>{errors.estimatedTime}</span>
            </div>
          )}
        </div>

        {/* 8 to 12 hours check-in warning */}
        {Number(estimatedHours) >= 8 && Number(estimatedHours) <= 12 && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-3 shadow-xs transition-all duration-300 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1 text-left">
              <p className="font-semibold text-sm">Are you sure?</p>
              <p className="text-xs text-amber-700 leading-relaxed font-medium">
                You are planning {estimatedHours} hours for this single activity. Please verify if this is correct.
              </p>
            </div>
          </div>
        )}

        {/* Overtime Warning Bar */}
        {isInputOvertime && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-start gap-3 shadow-xs transition-all duration-300">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1 text-left">
              <p className="font-semibold text-sm">Overtime Warning</p>
              <p className="text-xs text-rose-700 leading-relaxed font-medium">
                Your total planned time exceeds the company's daily working hours.
              </p>
            </div>
          </div>
        )}
      </div>
    </ModalData>
  );
}

