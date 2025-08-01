import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDatabase, off, onValue, ref, update } from "firebase/database";

import {
  endMeetingMutation,
  updateDetailMeetingMutation,
  useGetMeetingTiming,
} from "@/features/api/companyMeeting";
import { queryClient } from "@/queryClient";

export default function useMeetingDesc() {
  const { id: meetingId } = useParams();

  const [meetingResponse, setMeetingResponse] = useState<MeetingResFire | null>(
    null,
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<string>();
  const [isCardVisible, setIsCardVisible] = useState(false);

  const { data: meetingTiming } = useGetMeetingTiming(meetingId ?? "");

  const { mutate: endMeet } = endMeetingMutation();

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

  const handleTabChange = (tab: string) => {
    if (activeTab === tab) {
      setIsCardVisible(!isCardVisible);
    } else {
      setActiveTab(tab);
      setIsCardVisible(true);
    }
  };

  const handleConclusionMeeting = () => {
    if (meetingId) {
      const db = getDatabase();
      const meetStateRef = ref(db, `meetings/${meetingId}/state`);

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
    meetingStatus: meetingTiming?.status,
    meetingId,
    meetingResponse,
    meetingTiming,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    handleTabChange,
    activeTab,
    isCardVisible,
    setIsCardVisible,
    // handleTimeUpdate,
    handleConclusionMeeting,
    handleEndMeeting,
  };
}
