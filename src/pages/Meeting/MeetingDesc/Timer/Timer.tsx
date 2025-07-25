import { useEffect, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { formatTime } from "@/features/utils/app.utils";

interface TimerProps {
  plannedTime: number; // in seconds
  actualTime: number; // in seconds
  lastSwitchTimestamp: number; // timestamp in ms
  meetingStart?: boolean;
  onTimeUpdate?: (newTime: number) => void;
  isEditMode?: boolean;
  className?: string;
}

export default function Timer({
  plannedTime: initialPlannedTime,
  actualTime,
  lastSwitchTimestamp,
  meetingStart = false,
  onTimeUpdate,
  isEditMode = false,
  className,
}: TimerProps) {
  const [plannedTime, setPlannedTime] = useState(initialPlannedTime);
  const [editMode, setEditMode] = useState(isEditMode);
  const [minutesInput, setMinutesInput] = useState(
    String(Math.floor(plannedTime / 60))
  );
  const [secondsInput, setSecondsInput] = useState(
    String(plannedTime % 60).padStart(2, "0")
  );
  const [, forceUpdate] = useState(0);

  function formatTime(seconds: number) {
    const sign = seconds < 0 ? "-" : "";
    seconds = Math.abs(seconds);
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${sign}${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }

  // ⏱️ Force re-render every second for live countdown
  useEffect(() => {
    if (meetingStart && !editMode) {
      const interval = setInterval(() => {
        forceUpdate((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [meetingStart, editMode]);

  // 🧠 Dynamically calculate display time
  const getDisplayTime = (): number => {
    if (meetingStart) {
      const elapsed = (Date.now() - lastSwitchTimestamp) / 1000;
      return plannedTime - actualTime - elapsed;
    }
    return plannedTime;
  };

  const handleEditClick = () => {
    const time = Math.floor(getDisplayTime());
    setMinutesInput(String(Math.floor(time / 60)));
    setSecondsInput(String(time % 60).padStart(2, "0"));
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  const handleSave = () => {
    const min = parseInt(minutesInput, 10) || 0;
    let sec = parseInt(secondsInput, 10) || 0;
    if (sec > 59) sec = 59;
    const newTime = min * 60 + sec;

    setPlannedTime(newTime);
    onTimeUpdate?.(newTime);
    setEditMode(false);
  };

  const handleMinutesChange = (val: string) => {
    setMinutesInput(val.replace(/\D/g, "").slice(0, 2));
  };

  const handleSecondsChange = (val: string) => {
    setSecondsInput(val.replace(/\D/g, "").slice(0, 2));
  };

  return (
    <div className="flex items-center gap-2">
      {editMode ? (
        <>
          <Input
            value={minutesInput}
            onChange={(e) => handleMinutesChange(e.target.value)}
            className="w-[40px] p-0 text-center"
            placeholder="MM"
          />
          <span>:</span>
          <Input
            value={secondsInput}
            onChange={(e) => handleSecondsChange(e.target.value)}
            className="w-[40px] p-0 text-center"
            placeholder="SS"
          />
          <Button size="sm" onClick={handleSave} title="Save">
            <Check size={16} />
          </Button>
          <Button
            size="sm"
            onClick={handleCancel}
            variant="ghost"
            title="Cancel"
          >
            <X size={16} />
          </Button>
        </>
      ) : (
        <>
          <span
            className={className}
            style={{ color: getDisplayTime() < 0 ? "red" : undefined }}
          >
            {formatTime(Math.floor(getDisplayTime()))}
          </span>
          {!meetingStart && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEditClick}
              title="Edit time"
            >
              <Pencil size={16} />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
