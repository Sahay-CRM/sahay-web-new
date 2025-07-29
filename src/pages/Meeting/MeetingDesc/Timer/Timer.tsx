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
  // Initialize with either actualTime or defaultTime
  const [displayTime, setDisplayTime] = useState(
    actualTime !== undefined ? actualTime : defaultTime,
  );

  useEffect(() => {
    // When inactive or no lastSwitchTimestamp, use stored time
    if (!isActive || !lastSwitchTimestamp) {
      setDisplayTime(actualTime !== undefined ? actualTime : defaultTime);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = (now - lastSwitchTimestamp) / 1000;
      const currentTime = (actualTime || 0) + elapsedSeconds;

      setDisplayTime(Math.floor(currentTime));

      if (onTimeUpdate) {
        onTimeUpdate(currentTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [actualTime, lastSwitchTimestamp, isActive, defaultTime]);

  const formatTime = (totalSeconds: number) => {
    const absSeconds = Math.abs(totalSeconds);
    const minutes = Math.floor(absSeconds / 60);
    const seconds = Math.floor(absSeconds % 60);
    return `${totalSeconds < 0 ? "-" : ""}${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`${className} text-2xl`}>{formatTime(displayTime)}</div>
  );
}
