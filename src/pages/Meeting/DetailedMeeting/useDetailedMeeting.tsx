import {
  createMeetingMutation,
  endMeetingMutation,
  useGetCompanyMeetingById,
} from "@/features/api/companyMeeting";
import { getDatabase, off, onValue, ref } from "firebase/database";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function useDetailedMeeting() {
  const { id: meetingId } = useParams();

  const [meetingResponse, setMeetingResponse] = useState(null);

  const { data: meetingData, failureReason } = useGetCompanyMeetingById(
    meetingId ?? "",
  );
  const { mutate: createMeet } = createMeetingMutation();
  const { mutate: endMeet } = endMeetingMutation();

  const handleStartMeeting = useCallback(() => {
    if (meetingId) {
      createMeet(meetingId);
    }
  }, [createMeet, meetingId]);

  useEffect(() => {
    const db = getDatabase();
    const meetingRef = ref(db, `meetings/${meetingId}`);

    onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setMeetingResponse(data);
      } else {
        setMeetingResponse(null);
      }
    });

    return () => {
      off(meetingRef);
    };
  }, [meetingId]);

  const handleCloseMeeting = useCallback(() => {
    if (meetingId) {
      endMeet(meetingId);
    }
  }, [endMeet, meetingId]);

  return {
    meetingData,
    handleStartMeeting,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    failureReason: (failureReason as any)?.response?.data ?? failureReason,
    meetingResponse,
    handleCloseMeeting,
  };
}
