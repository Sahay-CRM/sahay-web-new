import { useEffect, useState, useMemo, useCallback } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AnimatedDigitProps {
  value: string;
  className?: string;
}

const AnimatedDigit = ({ value, className }: AnimatedDigitProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [animation, setAnimation] = useState<"up" | "down" | null>(null);
  const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  useEffect(() => {
    if (value !== displayValue) {
      setAnimation(Number(value) > Number(displayValue) ? "up" : "down");
      const timeout = setTimeout(() => setDisplayValue(value), 250);
      return () => clearTimeout(timeout);
    }
  }, [value, displayValue]);

  const getPosition = useCallback(() => {
    const current = Number(displayValue);
    return `-${current * 100}%`;
  }, [displayValue]);

  return (
    <span
      className={`relative h-8 overflow-hidden inline-block transition-all duration-1000 ease-in-out ${className}`}
    >
      <span
        className={`absolute inset-0 flex flex-col transition-transform duration-500 ease-in-out`}
        style={{
          transform: `translateY(${getPosition()})`,
          ...(animation && {
            transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }),
        }}
      >
        {digits.map((d) => (
          <span key={d} className="h-8 pt-2 flex items-center justify-center">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
};

interface TimerProps {
  meetingTime: number; // in seconds
  actualTime: number; // in seconds
  lastSwitchTimestamp: number; // timestamp in ms
  meetingStart?: boolean;
  onTimeUpdate?: (newTime: number) => void;
  isEditMode?: boolean;
  className?: string;
  meetingStatus?: string;
  isUpdating?: boolean; // Add loading state prop
}

export default function MeetingTimer({
  meetingTime: initialPlannedTime,
  actualTime,
  lastSwitchTimestamp,
  meetingStart = false,
  onTimeUpdate,
  isEditMode = false,
  className,
  meetingStatus,
  isUpdating = false, // New prop for loading state
}: TimerProps) {
  const [editMode, setEditMode] = useState(false);
  const [hoursInput, setHoursInput] = useState("");
  const [minutesInput, setMinutesInput] = useState("");
  const [currentTime, setCurrentTime] = useState(initialPlannedTime);
  const [editedTime, setEditedTime] = useState(initialPlannedTime);
  const [localUpdating, setLocalUpdating] = useState(false);

  const formatTime = useCallback(
    (
      seconds: number,
    ): {
      sign: string;
      hours: string;
      minutes: string;
    } => {
      const sign = seconds < 0 ? "-" : "";
      seconds = Math.abs(seconds);
      const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(
        2,
        "0",
      );
      return { sign, hours, minutes };
    },
    [],
  );

  const getDisplayTime = useCallback((): number => {
    if (meetingStart) {
      const elapsed = (Date.now() - lastSwitchTimestamp) / 1000;
      return initialPlannedTime - actualTime - elapsed;
    }
    return initialPlannedTime;
  }, [meetingStart, lastSwitchTimestamp, initialPlannedTime, actualTime]);

  useEffect(() => {
    if (!editMode && !localUpdating) {
      setCurrentTime(getDisplayTime());
    }
  }, [getDisplayTime, editMode, localUpdating]);

  useEffect(() => {
    if (meetingStart && !editMode && !localUpdating) {
      const interval = setInterval(() => {
        setCurrentTime(getDisplayTime());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [meetingStart, editMode, getDisplayTime, localUpdating]);

  const formattedTime = useMemo(
    () => formatTime(Math.floor(editMode ? editedTime : currentTime)),
    [editMode, editedTime, currentTime, formatTime],
  );

  const handleEditClick = () => {
    if (meetingStatus === "NOT_STARTED" || meetingStatus === "ENDED") {
      const time = Math.floor(currentTime);
      setHoursInput(String(Math.floor(time / 3600)));
      setMinutesInput(String(Math.floor((time % 3600) / 60)));
      setEditedTime(time);
      setEditMode(true);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setLocalUpdating(false);
  };

  const handleSave = async () => {
    const hours = parseInt(hoursInput, 10) || 0;
    const minutesRaw = parseInt(minutesInput, 10) || 0;

    // normalize minutes > 59 into hours
    const extraHours = Math.floor(minutesRaw / 60);
    const minutes = minutesRaw % 60;
    const totalHours = hours + extraHours;

    const newTime = totalHours * 3600 + minutes * 60;

    setLocalUpdating(true);

    try {
      // Update local state immediately for better UX
      setCurrentTime(newTime);

      // Call the API
      if (onTimeUpdate) {
        await onTimeUpdate(newTime);
      }

      // Update inputs so UI shows normalized values
      setHoursInput(String(totalHours));
      setMinutesInput(String(minutes).padStart(2, "0"));

      setEditMode(false);
    } catch (error) {
      // Revert local state on error
      setCurrentTime(initialPlannedTime);
      // eslint-disable-next-line no-console
      console.error("Failed to update time:", error);
    } finally {
      setLocalUpdating(false);
    }
  };

  const handleHoursChange = (value: string) => {
    const newHours = value.replace(/\D/g, "").slice(0, 2);
    setHoursInput(newHours);

    const hours = parseInt(newHours, 10) || 0;
    const minutes = parseInt(minutesInput, 10) || 0;
    setEditedTime(hours * 3600 + minutes * 60);
  };

  const handleMinutesChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    const numValue = parseInt(cleanValue || "0", 10);

    // Normalize minutes into hours + leftover minutes
    const extraHours = Math.floor(numValue / 60);
    const minutes = numValue % 60;

    const hours = (parseInt(hoursInput, 10) || 0) + extraHours;

    setHoursInput(String(hours));
    setMinutesInput(String(minutes).padStart(2, "0"));
    setEditedTime(hours * 3600 + minutes * 60);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const isLoading = isUpdating || localUpdating;

  return (
    <div className="flex items-center gap-2">
      {editMode ? (
        <div className="flex items-center gap-3 p-2">
          <div className="flex items-center gap-1">
            <Input
              value={hoursInput}
              onChange={(e) => handleHoursChange(e.target.value)}
              className="w-12 text-center p-1 text-lg"
              placeholder="0"
              autoFocus
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <span className="text-sm text-muted-foreground">h</span>
          </div>
          <div className="flex items-center gap-1">
            <Input
              value={minutesInput}
              onChange={(e) => handleMinutesChange(e.target.value)}
              className="w-12 text-center p-1 text-lg"
              placeholder="0"
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <span className="text-sm text-muted-foreground">m</span>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleCancel}
              title="Cancel"
              disabled={isLoading}
            >
              <X size={14} />
            </Button>
            <Button
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleSave}
              title="Save"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <span
            className={`${className} flex items-baseline gap-1 ${isLoading ? "opacity-50" : ""}`}
            style={{ color: currentTime < 0 ? "red" : undefined }}
          >
            {formattedTime.sign}
            {formattedTime.hours.split("").map((digit, index) => (
              <AnimatedDigit
                key={`h-${index}`}
                value={digit}
                className="text-3xl font-semibold w-4 text-center"
              />
            ))}
            <span className="text-[20px] font-normal">h</span>
            <span
              className={`text-3xl font-semibold ${
                meetingStatus !== undefined && meetingStatus !== "NOT_STARTED"
                  ? "animate-caret-blink"
                  : ""
              }`}
            >
              :
            </span>
            {formattedTime.minutes.split("").map((digit, index) => (
              <AnimatedDigit
                key={`m-${index}`}
                value={digit}
                className="text-3xl font-semibold w-4 text-center"
              />
            ))}
            <span className="text-[20px] font-normal">m</span>
          </span>

          {!meetingStart && isEditMode && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                handleEditClick();
              }}
              title="Edit time"
              className="text-muted-foreground hover:text-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Pencil size={16} />
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
