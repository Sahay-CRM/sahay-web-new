import {
  createMeetingMutation,
  endMeetingMutation,
  updateDetailMeetingMutation,
  useGetMeetingTiming,
} from "@/features/api/companyMeeting";
import { queryClient } from "@/queryClient";
import { getDatabase, off, onValue, ref, update } from "firebase/database";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function useMeetingDesc() {
  const { id: meetingId } = useParams();

  // const [plannedTime, setPlannedTime] = useState<number>();

  const [isMeetingStart, setIsMeetingStart] = useState(false);
  const [meetingResponse, setMeetingResponse] = useState<MeetingResFire | null>(
    null,
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<string>();
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [isIssueObjId, setIsIssueObjId] = useState();

  const { data: meetingTiming } = useGetMeetingTiming(meetingId ?? "");

  const { mutate: createMeet } = createMeetingMutation();
  const { mutate: endMeet } = endMeetingMutation();

  const { mutate: updateDetailMeeting } = updateDetailMeetingMutation();
  const [isPending, setIsPending] = useState(false);
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
        if (data && data.state.activeTab === "DISCUSSION") {
          const issueObjId = data.state.currentAgendaItemId;
          setIsIssueObjId(issueObjId);
        }
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
      setIsPending(true);
      createMeet(meetingId, {
        onSuccess: () => {
          setIsPending(false);
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

  const handleTabChange = (tab: string) => {
    if (activeTab === tab) {
      // Toggle card visibility when clicking the same tab
      setIsCardVisible(!isCardVisible);
    } else {
      setActiveTab(tab);
      setIsCardVisible(true); // Show card when switching to a different tab
    }
  };

  // const handleTimeUpdate = (newTime: number) => {
  //   // setPlannedTime(newTime);
  //   if (meetingId) {
  //     updateDetailMeeting({
  //       meetingId: meetingId,
  //       detailMeetingId: meetingTiming?.detailMeetingId,
  //       meetingTimePlanned: String(newTime), // Make sure API accepts it as string
  //     });
  //   }
  // };

  const handleConclusionMeeting = () => {
    if (meetingId) {
      const db = getDatabase();
      const meetStateRef = ref(db, `meetings/${meetingId}/state`);

      // const now = Date.now();
      // const elapsed = now - Number(meetingResponse?.state.lastSwitchTimestamp);

      // if (meetingTiming && meetingTiming.detailMeetingId) {
      // const objectiveActualTime =
      //   meetingResponse?.timers.objectives?.[
      //     currentItem.detailMeetingAgendaIssueId
      //   ].actualTime;
      // const time = (objectiveActualTime ?? 0) + elapsed;

      updateDetailMeeting(
        {
          meetingId: meetingId,
          status: "CONCLUSION",
        },
        {
          onSuccess: () => {
            update(meetStateRef, {
              activeTab: "CONCLUSION",
              lastSwitchTimestamp: Date.now(),
              status: "CONCLUSION",
            });
          },
        },
      );
    }
  };

  const handleEndMeeting = () => {
    if (meetingId) {
      endMeet(meetingId);
    }
  };

  return {
    handleStartMeeting,
    isMeetingStart,
    setIsMeetingStart,
    meetingStatus: meetingTiming?.status,
    meetingId,
    meetingResponse,
    meetingTiming,
    isPending,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    handleTabChange,
    activeTab,
    isCardVisible,
    setIsCardVisible,
    // handleTimeUpdate,
    handleConclusionMeeting,
    handleEndMeeting,
    isIssueObjId,
  };
}
