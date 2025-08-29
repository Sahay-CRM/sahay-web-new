import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { get, getDatabase, off, onValue, ref, update } from "firebase/database";

import { useAddUpdateCompanyMeeting } from "@/features/api/companyMeeting";
import { queryClient } from "@/queryClient";
import {
  addMeetingNotesMutation,
  addUpdateDetailMeetingMutation,
  deleteCompanyMeetingMutation,
  endMeetingMutation,
  updateDetailMeetingMutation,
  useGetMeetingNotes,
  useGetMeetingTiming,
} from "@/features/api/detailMeeting";

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
      meetingId: meetingTiming?.meetingId,
      noteType: activeTab === "updates" ? "UPDATES" : "APPRECIATION",
    },
    enable: !!meetingTiming?.meetingId,
  });

  const { mutate: endMeet } = endMeetingMutation();
  const { mutate: updateDetailMeeting } = updateDetailMeetingMutation();
  // const { mutate: updateMeetingTeamLeader } = addUpdateCompanyMeetingMutation();
  // const { mutate: updateTime } = addMeetingTimeMutation();
  const { mutate: addNote } = addMeetingNotesMutation();
  const deleteNoteMutation = deleteCompanyMeetingMutation();
  const { mutate: addMeeting } = useAddUpdateCompanyMeeting();

  const { mutate: addDetailMeeting } = addUpdateDetailMeetingMutation();

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

  // useEffect(() => {
  //   if (!meetingId || !meetingResponse) return;

  //   const meetingRef = ref(db, `meetings/${meetingId}/state/activeTab`);

  //   const unsubscribe = onValue(meetingRef, (snapshot) => {
  //     if (snapshot.exists()) {
  //       const activeTab = snapshot.val();

  //       handleUpdatedRefresh();
  //       if (activeTab === "CONCLUSION") {
  //         queryClient.resetQueries({
  //           queryKey: ["get-meeting-conclusion-res"],
  //         });
  //         queryClient.resetQueries({
  //           queryKey: ["get-meeting-conclusion-time-by-meetingId"],
  //         });
  //       } else if (activeTab === "ENDED") {
  //         handleUpdatedRefresh();
  //       }
  //     }
  //   });

  //   return () => unsubscribe();
  // }, [db, handleUpdatedRefresh, meetingId, meetingResponse]);

  useEffect(() => {
    if (!meetingId) return;

    const meetingRef = ref(db, `meetings/${meetingId}/state/activeTab`);

    const unsubscribe = onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        const activeTab = snapshot.val();

        handleUpdatedRefresh();

        const timer = setTimeout(() => {
          if (activeTab === "CONCLUSION") {
            queryClient.resetQueries({
              queryKey: ["get-meeting-conclusion-res"],
            });
            queryClient.resetQueries({
              queryKey: ["get-meeting-conclusion-time-by-meetingId"],
            });
          } else if (activeTab === "ENDED") {
            handleUpdatedRefresh();
          }
        }, 2000);

        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          handleUpdatedRefresh();
          queryClient.resetQueries({
            queryKey: ["get-meeting-conclusion-res"],
          });
        }, 1000);

        return () => clearTimeout(timer);
      }
    });

    return () => unsubscribe();
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
          detailMeetingStatus: "CONCLUSION",
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

  const handleAddTeamLeader = async (data: Joiners) => {
    const meetRef = ref(db, `meetings/${meetingId}/state`);
    const meetingSnapshot = await get(meetRef);

    const meetingJoiners = meetingTiming?.joiners;
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
      meetingId: meetingId,
      teamLeaders: updatedTeamLeaders,
    };
    addDetailMeeting(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["get-meeting-details-timing"],
        });
        if (!meetingSnapshot.exists()) {
          return;
        } else {
          update(meetRef, {
            updatedAt: new Date(),
          });
        }
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

  const handleCheckIn = (employeeId: string, attendanceMark: boolean) => {
    if (meetingId) {
      // console.log(attendanceMark, meetingId, employeeId);
      addDetailMeeting(
        {
          meetingId: meetingId,
          employeeId: employeeId,
          attendanceMark: attendanceMark,
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
      meetingNoteId: data.meetingNoteId,
      noteType: null,
    };
    addNote(payload, {
      onSuccess: () => {},
    });
  };

  const handleDelete = (id: string) => {
    deleteNoteMutation.mutate(id);
  };

  const handleAddEmp = async (data: EmployeeDetails[]) => {
    const meetingRef = ref(db, `meetings/${meetingId}`);
    const meetingSnapshot = await get(meetingRef);
    const meetStateRef = ref(db, `meetings/${meetingId}/state`);

    if (meetingId && meetingTiming?.meetingId) {
      const payload = {
        meetingId: meetingId,
        joiners: [
          ...(data?.map((item) => item.employeeId) || []),
          ...((meetingTiming.joiners as Joiners[])?.map(
            (em) => em.employeeId,
          ) || []),
        ],
      };
      addDetailMeeting(payload, {
        onSuccess: () => {
          if (!meetingSnapshot.exists()) {
            queryClient.invalidateQueries({
              queryKey: ["get-meeting-details-timing"],
            });
            return;
          }
          update(meetStateRef, {
            updatedAt: Date.now(),
          });
        },
      });
    }
  };

  const handleDeleteEmp = async (employeeId: string) => {
    const meetingRef = ref(db, `meetings/${meetingId}`);
    const meetingSnapshot = await get(meetingRef);
    const meetStateRef = ref(db, `meetings/${meetingId}/state`);

    const joiners = (meetingTiming?.joiners as Joiners[])
      ?.filter((item) => item.employeeId !== employeeId)
      ?.map((item) => item.employeeId);

    if (meetingId && meetingTiming?.meetingId) {
      const payload = {
        companyMeetingId: meetingId,
        joiners: joiners,
      };
      addMeeting(payload, {
        onSuccess: () => {
          if (!meetingSnapshot.exists()) {
            queryClient.invalidateQueries({
              queryKey: ["get-meeting-details-timing"],
            });
            return;
          }
          update(meetStateRef, {
            updatedAt: Date.now(),
          });
        },
      });
    }
  };

  return {
    meetingStatus: meetingTiming?.detailMeetingStatus,
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
    handleAddEmp,
    handleDeleteEmp,
  };
}
