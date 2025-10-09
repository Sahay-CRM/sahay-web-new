import { useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { get, off, onValue, ref, remove, update } from "firebase/database";
import { database } from "@/firebaseConfig";

import { queryClient } from "@/queryClient";
import {
  addMeetingNotesMutation,
  addUpdateDetailMeetingMutation,
  deleteCompanyMeetingMutation,
  updateDetailMeetingMutation,
  useGetMeetingNotes,
  useGetMeetingTiming,
} from "@/features/api/detailMeeting";
import SidebarControlContext from "@/features/layouts/DashboardLayout/SidebarControlContext";

export default function useMeetingDesc() {
  const { id: meetingId } = useParams();
  const sidebarControl = useContext(SidebarControlContext);

  const [meetingResponse, setMeetingResponse] = useState<MeetingResFire | null>(
    null,
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<string>();
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [openEmployeeId, setOpenEmployeeId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<
    boolean | null
  >(null);

  const { data: meetingData } = useGetMeetingTiming(meetingId ?? "");

  const meetingTiming = meetingData?.data as CompanyMeetingDataProps;

  const { data: meetingNotes } = useGetMeetingNotes({
    filter: {
      meetingId: meetingTiming?.meetingId,
      noteType: activeTab === "updates" ? "UPDATES" : "APPRECIATION",
    },
    enable: !!meetingTiming?.meetingId,
  });

  const { mutate: updateDetailMeeting } = updateDetailMeetingMutation();
  // const { mutate: updateMeetingTeamLeader } = addUpdateCompanyMeetingMutation();
  // const { mutate: updateTime } = addMeetingTimeMutation();
  const { mutate: addNote } = addMeetingNotesMutation();
  const deleteNoteMutation = deleteCompanyMeetingMutation();
  // const { mutate: addMeeting } = useAddUpdateCompanyMeeting();

  const { mutate: addDetailMeeting } = addUpdateDetailMeetingMutation();

  const handleUpdatedRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["get-meeting-details-timing"],
      }),
    ]);
  }, []);

  const db = database;

  useEffect(() => {
    const meetingRef = ref(db, `meetings/${meetingId}`);

    onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setMeetingResponse(data);
        if (data.state.status === "IN_PROGRESS") {
          setIsCardVisible(true);
          setActiveTab("documents");
        }
        if (sidebarControl?.setOpen) {
          sidebarControl.setOpen(false);
        }
      } else {
        setMeetingResponse(null);
      }
    });

    return () => {
      off(meetingRef);
    };
  }, [db, handleUpdatedRefresh, meetingId, sidebarControl]);

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
          queryClient.resetQueries({
            queryKey: ["get-meeting-conclusion-time-by-meetingId"],
          });
        } else if (activeTab === "ENDED") {
          handleUpdatedRefresh();
        }
      }
    });

    return () => unsubscribe();
  }, [db, handleUpdatedRefresh, meetingId, meetingResponse]);

  useEffect(() => {
    if (!meetingId) return;

    const meetingRef = ref(db, `meetings/${meetingId}/state/activeTab`);

    const filter = {
      meetingId: meetingId,
    };

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
              queryKey: ["get-meeting-conclusion-time-by-meetingId", filter],
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

  useEffect(() => {
    if (!meetingId) return;

    const meetingRef = ref(db, `meetings/${meetingId}/state/status`);

    const filter = {
      meetingId: meetingId,
    };

    const unsubscribe = onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        const activeTab = snapshot.val();
        handleUpdatedRefresh();

        if (activeTab === "IN_PROGRESS") {
          queryClient.resetQueries({
            queryKey: ["get-meeting-conclusion-res"],
          });
          queryClient.resetQueries({
            queryKey: ["get-meeting-conclusion-time-by-meetingId", filter],
          });
        } else if (activeTab === "ENDED") {
          handleUpdatedRefresh();
        }
      } else {
        handleUpdatedRefresh();
        queryClient.resetQueries({
          queryKey: ["get-meeting-conclusion-res"],
        });
      }
    });

    return () => unsubscribe();
  }, [db, handleUpdatedRefresh, meetingId]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab((prevTab) => {
      if (prevTab === tab) {
        setIsCardVisible((prev) => !prev);
        return tab;
      } else {
        setIsCardVisible(true);
        return tab;
      }
    });
  }, []);

  const handleConclusionMeeting = () => {
    if (meetingId) {
      const db = database;
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

  const handleAddTeamLeader = async (data: Joiners) => {
    if (
      meetingTiming?.detailMeetingStatus === "NOT_STARTED" ||
      meetingTiming?.detailMeetingStatus === "ENDED"
    ) {
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
        },
      });
    } else {
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
          if (!meetingSnapshot.exists()) {
            queryClient.invalidateQueries({
              queryKey: ["get-meeting-details-timing"],
            });
            return;
          } else {
            update(meetRef, {
              updatedAt: new Date(),
            });
          }
        },
      });
    }
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
  //             const db = database;
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

  const handleUnFollow = (employeeId: string) => {
    if (meetingId) {
      const meetRef = ref(db, `meetings/${meetingId}/state/unfollow`);
      update(meetRef, {
        [employeeId]: true,
      });
    }
  };

  const handleFollowBack = (employeeId: string) => {
    if (meetingId) {
      const employeeRef = ref(
        db,
        `meetings/${meetingId}/state/unfollow/${employeeId}`,
      );
      remove(employeeRef);
    }
  };

  const handleCheckIn = (employeeId: string, attendanceMark: boolean) => {
    if (meetingId) {
      addDetailMeeting(
        {
          meetingId: meetingId,
          employeeId: employeeId,
          attendanceMark: attendanceMark,
        },
        {
          onSuccess: () => {
            if (meetingId) {
              const db = database;
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
    if (
      meetingTiming?.detailMeetingStatus === "NOT_STARTED" ||
      meetingTiming?.detailMeetingStatus === "ENDED"
    ) {
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
          queryClient.invalidateQueries({
            queryKey: ["get-meeting-details-timing"],
          });
        },
      });
    } else {
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
    }
  };

  const handleDeleteEmp = async (employeeId: string) => {
    if (
      meetingTiming?.detailMeetingStatus === "NOT_STARTED" ||
      meetingTiming?.detailMeetingStatus === "ENDED"
    ) {
      const joiners = (meetingTiming?.joiners as Joiners[])
        ?.filter((item) => item.employeeId !== employeeId)
        ?.map((item) => item.employeeId);

      const payload = {
        meetingId: meetingId,
        joiners: joiners,
      };
      addDetailMeeting(payload, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["get-meeting-details-timing"],
          });
        },
      });
    } else {
      const meetingRef = ref(db, `meetings/${meetingId}`);
      const meetingSnapshot = await get(meetingRef);
      const meetStateRef = ref(db, `meetings/${meetingId}/state`);

      const joiners = (meetingTiming?.joiners as Joiners[])
        ?.filter((item) => item.employeeId !== employeeId)
        ?.map((item) => item.employeeId);

      if (meetingId && meetingTiming?.meetingId) {
        const payload = {
          meetingId: meetingId,
          joiners: joiners,
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
    }
  };

  useEffect(() => {
    const db = database;
    const meetingRef = ref(db, `meetings/${meetingId}/state/updatedAt`);

    const unsubscribe = onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        queryClient.invalidateQueries({
          queryKey: ["get-meeting-details-timing"],
        });
        queryClient.invalidateQueries({
          queryKey: ["get-meeting-notes"],
        });
        queryClient.invalidateQueries({
          queryKey: ["get-detail-meeting-obj-issue"],
        });
        queryClient.invalidateQueries({
          queryKey: ["get-detail-meeting-agenda-issue-obj"],
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [meetingId]);

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
    meetingData,
    handleUnFollow,
    handleFollowBack,
    selectedGroupFilter,
    setSelectedGroupFilter,
  };
}
