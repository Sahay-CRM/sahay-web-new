import { useEffect, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TimerProps {
  meetingTime: number; // in seconds
  actualTime: number; // in seconds
  lastSwitchTimestamp: number; // timestamp in ms
  meetingStart?: boolean;
  onTimeUpdate?: (newTime: number) => void;
  isEditMode?: boolean;
  className?: string;
}

export default function MeetingTimer({
  meetingTime: initialPlannedTime,
  actualTime,
  lastSwitchTimestamp,
  meetingStart = false,
  onTimeUpdate,
  isEditMode = false,
  className,
}: TimerProps) {
  // const [plannedTime, setPlannedTime] = useState(initialPlannedTime);
  const [editMode, setEditMode] = useState(isEditMode);
  const [hoursInput, setHoursInput] = useState(
    String(Math.floor(initialPlannedTime / 3600)),
  );
  const [minutesInput, setMinutesInput] = useState(
    String(Math.floor((initialPlannedTime % 3600) / 60)),
  );
  const [, forceUpdate] = useState(0);

  function formatTime(seconds: number): {
    sign: string;
    hours: string;
    minutes: string;
  } {
    const sign = seconds < 0 ? "-" : "";
    seconds = Math.abs(seconds);
    const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    return { sign, hours, minutes };
  }

  useEffect(() => {
    if (meetingStart && !editMode) {
      const interval = setInterval(() => {
        forceUpdate((prev) => prev + 1);
      }, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [meetingStart, editMode]);

  const getDisplayTime = (): number => {
    if (meetingStart) {
      const elapsed = (Date.now() - lastSwitchTimestamp) / 1000;
      return initialPlannedTime - actualTime - elapsed;
    }
    return initialPlannedTime;
  };

  const handleEditClick = () => {
    const time = Math.floor(getDisplayTime());
    setHoursInput(String(Math.floor(time / 3600)));
    setMinutesInput(String(Math.floor((time % 3600) / 60)));
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  const handleSave = () => {
    const hours = parseInt(hoursInput, 10) || 0;
    let min = parseInt(minutesInput, 10) || 0;
    if (min > 59) min = 59;
    const newTime = hours * 3600 + min * 60;

    // setPlannedTime(newTime);
    onTimeUpdate?.(newTime);
    setEditMode(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const { sign, hours, minutes } = formatTime(Math.floor(getDisplayTime()));

  return (
    <div className="flex items-center gap-2">
      {editMode ? (
        <div className="flex items-center gap-3 p-2">
          <div className="flex items-center gap-1">
            <Input
              value={hoursInput}
              onChange={(e) =>
                setHoursInput(e.target.value.replace(/\D/g, "").slice(0, 2))
              }
              className="w-12 text-center p-1 text-lg"
              placeholder="0"
              autoFocus
              onKeyDown={handleKeyDown}
            />
            <span className="text-sm text-muted-foreground">h</span>
          </div>
          <div className="flex items-center gap-1">
            <Input
              value={minutesInput}
              onChange={(e) =>
                setMinutesInput(e.target.value.replace(/\D/g, "").slice(0, 2))
              }
              className="w-12 text-center p-1 text-lg"
              placeholder="0"
              onKeyDown={handleKeyDown}
            />
            <span className="text-sm text-muted-foreground">m</span>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              // variant="outline"
              className="h-8 w-8 p-0"
              onClick={handleCancel}
              title="Cancel"
            >
              <X size={14} />
            </Button>
            <Button
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleSave}
              title="Save"
            >
              <Check size={14} />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <span
            className={`${className} flex items-baseline gap-1`}
            style={{ color: getDisplayTime() < 0 ? "red" : undefined }}
          >
            {sign}
            <span className="text-3xl font-semibold">{hours}</span>
            <span className="text-sm font-normal">h</span> :
            <span className="text-3xl font-semibold">{minutes}</span>
            <span className="text-sm font-normal">m</span>
          </span>

          {!meetingStart && isEditMode && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEditClick}
              title="Edit time"
              className="text-muted-foreground hover:text-primary"
            >
              <Pencil size={16} />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
