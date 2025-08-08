import { useEffect, useState } from "react";

interface TimerProps {
  defaultTime?: number; // Default time in seconds (optional)
  actualTime: number; // Current accumulated time in seconds from Firebase
  lastSwitchTimestamp: number; // Last activation time in milliseconds
  isActive: boolean; // Whether this timer is currently active
  onTimeUpdate?: (time: number) => void; // Callback for time updates
  className?: string;
}

export default function Timer({
  defaultTime = 0,
  actualTime,
  lastSwitchTimestamp,
  isActive,
  onTimeUpdate,
  className,
}: TimerProps) {
  const safeActualTime = Number.isFinite(actualTime) ? actualTime : 0;
  const safeDefaultTime = Number.isFinite(defaultTime) ? defaultTime : 0;

  // const [displayTime, setDisplayTime] = useState(actualTime || defaultTime);
  const [displayTime, setDisplayTime] = useState(
    safeActualTime || safeDefaultTime,
  );

  useEffect(() => {
    if (!isActive || !lastSwitchTimestamp) {
      setDisplayTime(safeActualTime || safeDefaultTime);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = (now - lastSwitchTimestamp) / 1000;
      const currentTime = safeActualTime + elapsedSeconds;

      setDisplayTime(currentTime);

      if (onTimeUpdate) {
        onTimeUpdate(currentTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    safeActualTime,
    lastSwitchTimestamp,
    isActive,
    safeDefaultTime,
    onTimeUpdate,
  ]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return <div className={className}>{formatTime(displayTime)}</div>;
}
