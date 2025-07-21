import { formatTime } from "@/features/utils/app.utils";
import { useEffect, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TimerProps {
  plannedTime: number;
  actualTime: number;
  lastSwitchTimestamp: number;
  meetingStart?: boolean;
  onTimeUpdate?: (newTime: number) => void;
  // defaultTime?: number;
  isEditMode?: boolean;
  className?: string;
}

export default function Timer({
  plannedTime,
  actualTime,
  lastSwitchTimestamp,
  meetingStart = false,
  onTimeUpdate,
  // defaultTime,
  isEditMode = false,
  className,
}: TimerProps) {
  const [displayTime, setDisplayTime] = useState(plannedTime - actualTime);
  const [editMode, setEditMode] = useState(isEditMode);
  const [editMinutes, setEditMinutes] = useState(
    Math.floor(plannedTime / 60).toString(),
  );
  const [editSeconds, setEditSeconds] = useState(
    (plannedTime % 60).toString().padStart(2, "0"),
  );

  useEffect(() => {
    if (!editMode && meetingStart) {
      function update() {
        const now = Date.now();
        const elapsed = now - lastSwitchTimestamp;
        const remaining = plannedTime * 1000 - (actualTime + elapsed);
        setDisplayTime(remaining);
      }
      update();
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    }
  }, [plannedTime, actualTime, lastSwitchTimestamp, editMode, meetingStart]);

  const handleEdit = () => {
    const baseTime =
      !meetingStart && plannedTime !== undefined ? plannedTime : plannedTime;
    setEditMinutes(Math.floor(baseTime / 60).toString());
    setEditSeconds((baseTime % 60).toString().padStart(2, "0"));
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  const handleSubmit = () => {
    const min = parseInt(editMinutes, 10) || 0;
    const sec = parseInt(editSeconds, 10) || 0;
    const newTime = min * 60 + sec;
    setEditMode(false);
    if (onTimeUpdate) onTimeUpdate(newTime);
    setDisplayTime(newTime);
  };

  if (!meetingStart) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {editMode ? (
          <>
            <Input
              value={`${editMinutes.padStart(2, "0")}:${editSeconds.padStart(2, "0")}`}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9:]/g, "");
                const [min = "0", sec = "0"] = val.split(":");
                setEditMinutes(min.slice(0, 2));
                setEditSeconds(sec.slice(0, 2));
              }}
              placeholder="mm:ss"
              style={{ width: 70, textAlign: "center" }}
              maxLength={5}
            />
            <Button
              onClick={handleSubmit}
              size="sm"
              style={{ marginLeft: 4 }}
              title="Submit"
            >
              <Check size={16} />
            </Button>
            <Button
              onClick={handleCancel}
              size="sm"
              style={{ marginLeft: 2 }}
              title="Cancel"
            >
              <X size={16} />
            </Button>
          </>
        ) : (
          <>
            <span
              style={{ color: displayTime < 0 ? "red" : undefined }}
              className={className}
            >
              {`${editMinutes.padStart(2, "0")}:${editSeconds.padStart(2, "0")}`}
            </span>
            <Button
              onClick={handleEdit}
              size="sm"
              style={{ marginLeft: 6 }}
              variant="ghost"
              title="Edit time"
            >
              <Pencil size={16} />
            </Button>
          </>
        )}
      </span>
    );
  }

  return (
    <span
      style={{ color: displayTime < 0 ? "red" : undefined }}
      className={className}
    >
      {formatTime(displayTime)}
    </span>
  );
}
