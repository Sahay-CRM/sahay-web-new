import {
  createMeetingMutation,
  endMeetingMutation,
  useGetCompanyMeetingById,
} from "@/features/api/companyMeeting";
import { queryClient } from "@/queryClient";
import { getDatabase, off, onValue, ref } from "firebase/database";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function useDetailedMeeting() {
  const { id: meetingId } = useParams();

  const [meetingResponse, setMeetingResponse] = useState<MeetingResFire | null>(
    null,
  );

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

  const handleUpdatedRefresh = useCallback(async () => {
    const activeTab = meetingResponse?.activeScreen;

    await Promise.all([
      ...(activeTab === "agenda"
        ? [
            queryClient.resetQueries({ queryKey: ["get-meeting-issue"] }),
            queryClient.resetQueries({ queryKey: ["get-meeting-objective"] }),
          ]
        : []),
      ...(activeTab === "tasks"
        ? [queryClient.resetQueries({ queryKey: ["get-meeting-tasks-res"] })]
        : []),
      ...(activeTab === "project"
        ? [queryClient.resetQueries({ queryKey: ["get-meeting-Project-res"] })]
        : []),
      ...(activeTab === "kpis"
        ? [queryClient.resetQueries({ queryKey: ["get-meeting-kpis-res"] })]
        : []),
    ]);
  }, [meetingResponse?.activeScreen]);

  useEffect(() => {
    const db = getDatabase();
    const meetingRef = ref(db, `meetings/${meetingId}`);

    onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setMeetingResponse(data);
        handleUpdatedRefresh();
      } else {
        setMeetingResponse(null);
      }
    });

    return () => {
      off(meetingRef);
    };
  }, [handleUpdatedRefresh, meetingId]);

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
