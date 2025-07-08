import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Clock } from "lucide-react";
import { useDispatch } from "react-redux";

interface TimerProps {
  initialMinutes?: number;
  onTimeChange?: (minutes: number) => void;
  className?: string;
  isActive?: boolean;
  timeOverride?: number; // in seconds
  readOnly?: boolean;
  onTimeSpent?: (seconds: number) => void;
  showEditButton?: boolean;
  meetingId: string;
  tabName: string;
}

const Timer: React.FC<TimerProps> = ({
  initialMinutes = 5,
  onTimeChange,
  className = "",
  isActive = false,
  timeOverride,
  readOnly = false,
  onTimeSpent,
  showEditButton = true,
  meetingId,
  tabName,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialMinutes.toString());
  const [isOvertime, setIsOvertime] = useState(false);
  const [overtimeSeconds, setOvertimeSeconds] = useState(0);
  const dispatch = useDispatch();

  const storageKey = `timer_${meetingId}_${tabName}`;

  useEffect(() => {
    const savedTimer = localStorage.getItem(storageKey);
    if (savedTimer) {
      const {
        endTime,
        remainingSeconds,
        isActive: wasActive,
      } = JSON.parse(savedTimer);

      if (isActive && wasActive && endTime) {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          setIsOvertime(true);
          setOvertimeSeconds(Math.abs(remaining));
        }
      } else {
        setTimeLeft(remainingSeconds);
        if (remainingSeconds <= 0) {
          setIsOvertime(true);
          setOvertimeSeconds(0);
        }
      }
    }
  }, [dispatch, meetingId, tabName, storageKey, isActive]);

  const saveTimerState = useCallback(() => {
    const stateToSave = {
      isActive,
      remainingSeconds: timeLeft,
      ...(isActive &&
        timeLeft > 0 && { endTime: Date.now() + timeLeft * 1000 }),
    };

    localStorage.setItem(storageKey, JSON.stringify(stateToSave));
  }, [isActive, timeLeft, storageKey]);

  // Save timer when active state changes
  useEffect(() => {
    saveTimerState();
  }, [isActive, saveTimerState]);

  useEffect(() => {
    if (isActive) {
      saveTimerState();
    }
  }, [timeLeft, isActive, saveTimerState]);

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      localStorage.removeItem(storageKey);
    }
  }, [timeLeft, isActive, storageKey]);

  useEffect(() => {
    if (readOnly) return;

    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime > 0) {
            const newTime = prevTime - 1;
            // Report time spent (original time minus remaining time)
            onTimeSpent?.(initialMinutes * 60 - newTime);
            return newTime;
          } else {
            setIsOvertime(true);
            setOvertimeSeconds((prev) => prev + 1);
            // Report full time spent when in overtime
            onTimeSpent?.(initialMinutes * 60 + overtimeSeconds + 1);
            return 0;
          }
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, readOnly, onTimeSpent, initialMinutes, overtimeSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(Math.floor(timeLeft / 60).toString());
    saveTimerState();
  };

  const handleSaveEdit = () => {
    const newMinutes = parseInt(editValue);
    if (newMinutes > 0) {
      const newSeconds = newMinutes * 60;
      setTimeLeft(newSeconds);
      setIsOvertime(false);
      setOvertimeSeconds(0);
      setIsEditing(false);
      onTimeChange?.(newMinutes);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue(Math.floor(timeLeft / 60).toString());
  };

  // If readOnly and timeOverride is provided, just display that time
  const displayTime =
    readOnly && typeof timeOverride === "number"
      ? timeOverride
      : isOvertime
        ? overtimeSeconds
        : timeLeft;

  // Check if we're showing overtime for readOnly timer (discussion timer)
  const isDiscussionOvertime =
    readOnly && typeof timeOverride === "number" && timeOverride < 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="h-4 w-4 text-primary" />
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-16 h-8 text-center"
            min="1"
            max="999"
          />
          <span className="text-sm text-muted-foreground">min</span>
          <Button size="sm" onClick={handleSaveEdit} className="h-8 px-2">
            ✓
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancelEdit}
            className="h-8 px-2"
          >
            ✕
          </Button>
        </div>
      ) : (
        <div className="flex items-center w-full">
          <span
            className={`font-mono text-sm font-semibold ${isOvertime || isDiscussionOvertime ? "text-red-500" : ""}`}
          >
            {isOvertime
              ? `+${formatTime(overtimeSeconds)}`
              : isDiscussionOvertime
                ? `+${formatTime(Math.abs(timeOverride))}`
                : displayTime > 0
                  ? formatTime(displayTime)
                  : `-${formatTime(Math.abs(displayTime))}`}
          </span>
          {showEditButton && !readOnly && (
            <span
              onClick={handleEdit}
              className="h-6 w-6 ml-1 cursor-pointer flex items-center justify-center hover:bg-gray-100 rounded"
              title="Edit"
            >
              <Pencil className="h-3 w-3 text-gray-500 hover:text-gray-700" />
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Timer;
