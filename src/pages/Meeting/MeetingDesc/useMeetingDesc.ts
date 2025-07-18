import {
  createMeetingMutation,
  updateDetailMeetingMutation,
  useGetCompanyMeetingById,
  useGetMeetingTiming,
} from "@/features/api/companyMeeting";
import { getMeeting } from "@/features/selectors/auth.selector";
import { queryClient } from "@/queryClient";
import { getDatabase, off, onValue, ref, update } from "firebase/database";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

export default function useMeetingDesc() {
  const { id: meetingId } = useParams();

  const agendaList = useSelector(getMeeting);

  const [isMeetingStart, setIsMeetingStart] = useState(false);
  const [meetingResponse, setMeetingResponse] = useState<MeetingResFire | null>(
    null,
  );

  const { data: meetingTiming } = useGetMeetingTiming(meetingId ?? "");

  const { mutate: createMeet } = createMeetingMutation();

  const { mutate: updateDetailMeeting } = updateDetailMeetingMutation();
  const { data: meetingData } = useGetCompanyMeetingById(meetingId ?? "");

  const handleUpdatedRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.resetQueries({ queryKey: ["get-meeting-details-timing"] }),
      // queryClient.resetQueries({ queryKey: ["get-meeting-issue"] }),
      // queryClient.resetQueries({ queryKey: ["get-meeting-objective"] }),
    ]);
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const meetingRef = ref(db, `meetings/${meetingId}`);

    onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log(data);

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

  // const agendaFireBase = (id: string) => {
  //   if (meetingStatus) {
  //     const db = getDatabase();
  //     const meetRef = ref(db, `meetings/${meetingId}/timers/issues/${id}`);
  //     update(meetRef, {
  //       updatedAt: Date.now(),
  //     });
  //   }
  // };

  const handleDesc = () => {
    const now = Date.now();
    const totalAgendaTime =
      now - Number(meetingResponse?.state.lastSwitchTimestamp);

    if (meetingId) {
      const db = getDatabase();
      const meetStateRef = ref(db, `meetings/${meetingId}/state`);
      updateDetailMeeting(
        {
          meetingId: meetingId,
          status: "DISCUSSION",
          agendaTimeActual: String(totalAgendaTime / 1000),
        },
        {
          onSuccess: () => {
            update(meetStateRef, {
              activeTab: "DISCUSSION",
              lastSwitchTimestamp: Date.now(),
              status: "DISCUSSION",
              currentAgendaItemId:
                agendaList.items[0].detailMeetingAgendaIssueId,
            });
          },
        },
      );
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
    meetingResponse,
    meetingTiming,
  };
}
