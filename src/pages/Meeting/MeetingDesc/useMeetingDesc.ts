import {
  createMeetingMutation,
  updateDetailMeetingMutation,
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

  const handleUpdatedRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["get-meeting-details-timing"],
      }),
    ]);
  }, []);

  const db = getDatabase();
  useEffect(() => {
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
  }, [db, handleUpdatedRefresh, meetingId]);

  useEffect(() => {
    const meetingRef = ref(db, `meetings/${meetingId}/state/activeTab`);

    onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        handleUpdatedRefresh();
      }
    });

    return () => {
      off(meetingRef);
    };
  }, [db, handleUpdatedRefresh, meetingId]);

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
      const meetAgendaRef = ref(db, `meetings/${meetingId}/timers/agenda`);
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
            update(meetAgendaRef, {
              actualTime: String(totalAgendaTime),
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
    meetingId,
    meetingResponse,
    meetingTiming,
  };
}
