import { Button } from "@/components/ui/button";
import useConclusion from "./useConclusion";
import { useEffect, useState } from "react";

interface ConclusionProps {
  meetingStatus: string;
  meetingResponse: MeetingResFire | null;
}

export default function Conclusion({
  meetingStatus,
  meetingResponse,
}: ConclusionProps) {
  const { handleCloseMeetingWithLog } = useConclusion();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (meetingResponse?.state.lastSwitchTimestamp) {
      const interval = setInterval(() => {
        const now = Date.now();
        setElapsed(now - Number(meetingResponse.state.lastSwitchTimestamp));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [meetingResponse?.state.lastSwitchTimestamp]);

  // Format elapsed ms to mm:ss
  const minutes = String(Math.floor(elapsed / 60000)).padStart(2, "0");
  const seconds = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, "0");
  const formattedTime = `${minutes}:${seconds}`;

  return (
    <div>
      {meetingStatus === "CONCLUSION" && (
        <Button
          variant="destructive"
          className="ml-5"
          onClick={handleCloseMeetingWithLog}
        >
          End Meeting
        </Button>
      )}

      <div>Conclusion</div>
      <div>Elapsed Time: {formattedTime}</div>
    </div>
  );
}
