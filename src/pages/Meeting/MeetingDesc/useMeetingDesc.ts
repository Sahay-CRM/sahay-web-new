import {
  createMeetingMutation,
  updateDetailMeetingMutation,
  useGetCompanyMeetingById,
  useGetMeetingTiming,
} from "@/features/api/companyMeeting";
import { useState } from "react";
import { useParams } from "react-router-dom";

export default function useMeetingDesc() {
  const { id: meetingId } = useParams();

  const [isMeetingStart, setIsMeetingStart] = useState(false);

  const { data: meetingTiming } = useGetMeetingTiming(meetingId ?? "");

  const { mutate: createMeet } = createMeetingMutation();

  const { mutate: updateDetailMeeting } = updateDetailMeetingMutation();
  const { data: meetingData } = useGetCompanyMeetingById(meetingId ?? "");

  // Accept callbacks for onStart and onEnd
  const handleStartMeeting = () => {
    if (meetingId) {
      createMeet(meetingId, {
        onSuccess: () => {
          setIsMeetingStart(true);
        },
      });
    }
  };

  const handleDesc = () => {
    if (meetingId) {
      updateDetailMeeting({
        meetingId: meetingId,
        status: "DISCUSSION",
      });
    }
  };

  return {
    handleStartMeeting,
    isMeetingStart,
    setIsMeetingStart,
    meetingStatus: meetingTiming?.status,
    handleDesc,
    meetingData,
    meetingId,
  };
}
