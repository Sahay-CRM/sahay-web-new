import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import ModalData from "@/components/shared/Modal/ModalData";

interface CompleteTaskTimeModalProps {
  open: boolean;
  taskName?: string;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (actualMinutes: number) => void;
}

const inputClass =
  "w-15 text-center text-2xl font-extrabold text-slate-800 bg-transparent border-b-2 border-slate-300 focus:border-primary focus:outline-none pb-1 transition-all placeholder:text-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

export default function CompleteTaskTimeModal({
  open,
  taskName,
  isLoading,
  onClose,
  onSubmit,
}: CompleteTaskTimeModalProps) {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setHours("");
      setMinutes("");
      setError("");
    }
  }, [open]);

  const sanitize = (value: string, max: number) => {
    const val = value.replace(/[^0-9]/g, "").slice(0, 2);
    return Number(val) > max ? String(max) : val;
  };

  const handleSubmit = () => {
    const total = (Number(hours) || 0) * 60 + (Number(minutes) || 0);
    if (total <= 0) {
      setError("Time must be greater than 0");
      return;
    }
    onSubmit(total);
  };

  return (
    <ModalData
      isModalOpen={open}
      modalTitle={taskName || "Complete Task"}
      modalClose={onClose}
      buttons={[
        {
          btnText: "Cancel",
          buttonCss:
            "py-1.5 px-5 bg-transparent text-slate-700 border hover:bg-slate-50",
          btnClick: onClose,
        },
        {
          btnText: "Update",
          buttonCss: "py-1.5 px-5",
          btnClick: handleSubmit,
          isLoading,
        },
      ]}
    >
      <div className="space-y-6 py-2">
        <p className="text-slate-500 text-sm leading-relaxed">
          Specify the actual time taken to complete this task.
        </p>

        <div className="flex flex-col items-center justify-center p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-2">
              <input
                type="number"
                min={0}
                value={hours}
                onChange={(e) => {
                  setHours(sanitize(e.target.value, 12));
                  setError("");
                }}
                className={inputClass}
                placeholder="0"
              />
              <span className="text-slate-500 font-semibold text-lg">hr</span>
            </div>

            <span className="text-slate-300 text-2xl font-light pb-2">:</span>

            <div className="flex items-baseline gap-2">
              <input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => {
                  setMinutes(sanitize(e.target.value, 59));
                  setError("");
                }}
                className={inputClass}
                placeholder="00"
              />
              <span className="text-slate-500 font-semibold text-lg">min</span>
            </div>
          </div>

          {error && (
            <div className="text-rose-600 text-sm flex items-center gap-1.5 mt-4">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </ModalData>
  );
}
