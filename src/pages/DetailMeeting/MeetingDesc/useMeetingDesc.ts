import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDatabase, off, onValue, ref, update } from "firebase/database";

import {
  addMeetingNotesMutation,
  addMeetingTimeMutation,
  addUpdateCompanyMeetingMutation,
  deleteCompanyMeetingMutation,
  endMeetingMutation,
  updateDetailMeetingMutation,
  useGetMeetingNotes,
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
  const [openEmployeeId, setOpenEmployeeId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const { data: meetingTiming } = useGetMeetingTiming(meetingId ?? "");
  const { data: meetingNotes } = useGetMeetingNotes({
    filter: {
      meetingId: meetingTiming?.detailMeetingId,
      noteType: activeTab === "updates" ? "UPDATES" : "APPRECIATION",
    },
    enable: !!meetingTiming?.detailMeetingId,
  });

  const { mutate: endMeet } = endMeetingMutation();
  const { mutate: updateDetailMeeting } = updateDetailMeetingMutation();
  const { mutate: updateMeetingTeamLeader } = addUpdateCompanyMeetingMutation();
  const { mutate: updateTime } = addMeetingTimeMutation();
  const { mutate: addNote } = addMeetingNotesMutation();
  const deleteNoteMutation = deleteCompanyMeetingMutation();

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
    if (!meetingId || !meetingResponse) return;

    const meetingRef = ref(db, `meetings/${meetingId}/state/activeTab`);

    const unsubscribe = onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        const activeTab = snapshot.val();

        handleUpdatedRefresh();
        if (activeTab === "CONCLUSION") {
          queryClient.resetQueries({
            queryKey: ["get-meeting-conclusion-res"],
          });
        }
      }
    });

    return () => unsubscribe();
  }, [db, handleUpdatedRefresh, meetingId, meetingResponse]);

  useEffect(() => {
    if (!meetingId || !meetingResponse) return; // ✅ don't run if meeting deleted

    const meetingRef = ref(db, `meetings/${meetingId}/state/updatedAt`);

    const unsubscribe = onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        handleUpdatedRefresh();
      }
    });

    return () => unsubscribe();
  }, [db, handleUpdatedRefresh, meetingId, meetingResponse]);

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

  const handleAddTeamLeader = (data: Joiners) => {
    const meetRef = ref(db, `meetings/${meetingId}/state`);
    const meetingJoiners = meetingTiming?.employeeList;
    const teamLeader = (meetingJoiners as Joiners[])
      ?.filter((da) => da.isTeamLeader)
      .map((item) => item.employeeId);

    let updatedTeamLeaders: string[];
    if (teamLeader?.includes(data.employeeId)) {
      updatedTeamLeaders = teamLeader.filter((id) => id !== data.employeeId);
    } else {
      updatedTeamLeaders = [...(teamLeader || []), data.employeeId];
    }

    const payload = {
      companyMeetingId: meetingId,
      teamLeaders: updatedTeamLeaders,
    };
    updateMeetingTeamLeader(payload, {
      onSuccess: () => {
        update(meetRef, {
          updatedAt: new Date(),
        });
      },
    });
  };
  // const handleCheckOut = (employeeId: string) => {
  //   if (meetingId) {
  //     updateTime(
  //       {
  //         meetingId: meetingId,
  //         employeeId: employeeId,
  //         attendanceMark: false,
  //         updatedAt: new Date().toISOString(),
  //       },
  //       {
  //         onSuccess: () => {
  //           if (meetingId) {
  //             const db = getDatabase();
  //             const meetRef = ref(db, `meetings/${meetingId}/state`);
  //             update(meetRef, { updatedAt: new Date() });
  //           }
  //         },
  //       }
  //     );
  //   }
  // };

  const handleFollow = (employeeId: string) => {
    if (meetingId) {
      const meetRef = ref(db, `meetings/${meetingId}/state`);
      update(meetRef, {
        follow: employeeId,
        updatedAt: new Date(),
      });
    }
  };

  const handleCheckIn = (item: Joiners, attendanceMark: boolean) => {
    if (meetingId) {
      updateTime(
        {
          meetingId: meetingId,
          employeeId: item.employeeId,
          attendanceMark: attendanceMark,
          updatedAt: new Date().toISOString(),
        },
        {
          onSuccess: () => {
            if (meetingId) {
              const db = getDatabase();
              const meetRef = ref(db, `meetings/${meetingId}/state`);
              update(meetRef, { updatedAt: new Date() });
            }
          },
        },
      );
    }
  };

  const handleUpdateNotes = (data: MeetingNotesRes) => {
    const payload = {
      detailMeetingNoteId: data.detailMeetingNoteId,
      noteType: null,
    };
    addNote(payload, {
      onSuccess: () => {},
    });
  };

  const handleDelete = (id: string) => {
    deleteNoteMutation.mutate(id);
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
    openEmployeeId,
    setOpenEmployeeId,
    handleAddTeamLeader,
    // handleCheckOut,
    follow: meetingResponse?.state.follow,
    handleFollow,
    handleCheckIn,
    meetingNotes,
    handleUpdateNotes,
    dropdownOpen,
    setDropdownOpen,
    handleDelete,
  };
}
