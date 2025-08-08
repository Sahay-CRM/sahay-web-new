import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getDatabase, off, onValue, ref, update } from "firebase/database";

import {
  addMeetingAgendaMutation,
  addMeetingTimeMutation,
  createMeetingMutation,
  deleteMeetingObjectiveMutation,
  editAgendaTimingMeetingMutation,
  endMeetingMutation,
  updateDetailMeetingMutation,
  useGetDetailMeetingAgenda,
  useGetDetailMeetingAgendaIssue,
  useGetDetailMeetingObj,
} from "@/features/api/companyMeeting";
import { addUpdateIssues } from "@/features/api/Issues";
import { addUpdateObjective } from "@/features/api/Objective";
import { queryClient } from "@/queryClient";
import { setMeeting } from "@/features/reducers/common.reducer";
import useGetMeetingConclusion from "@/features/api/companyMeeting/useGetMeetingConclusion";
import SidebarControlContext from "@/features/layouts/DashboardLayout/SidebarControlContext";
// import { getUserId } from "@/features/selectors/auth.selector";

interface UseAgendaProps {
  meetingId: string;
  meetingStatus?: string;
  meetingResponse?: MeetingResFire | null;
  detailMeetingId: string | undefined;
  canEdit: boolean;
}

type ActiveTab = "tasks" | "projects" | "kpis";

export const useAgenda = ({
  meetingId,
  meetingStatus,
  meetingResponse,
  detailMeetingId,
  canEdit,
}: UseAgendaProps) => {
  const dispatch = useDispatch();
  const db = getDatabase();
  const meetStateRef = ref(db, `meetings/${meetingId}/state`);
  const sidebarControl = useContext(SidebarControlContext);

  const [issueInput, setIssueInput] = useState("");
  const [editing, setEditing] = useState<{
    type: "issue" | "objective" | null;
    id: string | null;
    value: string;
    plannedMinutes: string;
    plannedSeconds: string;
    detailMeetingAgendaIssueId: string;
  }>({
    type: null,
    id: null,
    value: "",
    plannedMinutes: "",
    plannedSeconds: "",
    detailMeetingAgendaIssueId: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIssue, setModalIssue] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [agendaList, setAgendaList] = useState<MeetingAgenda[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isSelectedAgenda, setIsSelectedAgenda] = useState<string>();
  const [isSideBar, setIsSideBar] = useState(false);
  // const [elapsed, setElapsed] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>();
  // const [meetingConclusionTime, setMeetingConclusionTime] = useState<number>();
  const [selectedItem, setSelectedItem] = useState<AgendaResConclusion | null>(
    null,
  );
  const [addIssueModal, setAddIssueModal] = useState(false);

  const [isMeetingStart, setIsMeetingStart] = useState(false);

  useEffect(() => {
    if (meetingResponse) {
      setIsSelectedAgenda(meetingResponse.state.currentAgendaItemId);
    }
  }, [meetingResponse]);

  // API hooks
  const { data: selectedAgenda } = useGetDetailMeetingAgenda({
    filter: {
      detailMeetingId: detailMeetingId,
    },
    enable: !!detailMeetingId,
  });

  const { data: detailAgendaData } = useGetDetailMeetingAgendaIssue({
    filter: {
      detailMeetingAgendaIssueId: meetingResponse?.state.currentAgendaItemId,
    },
    enable: !!meetingResponse?.state.currentAgendaItemId,
  });

  const shouldFetch = issueInput.length >= 3;
  const { data: issueData } = useGetDetailMeetingObj({
    filter: {
      search: issueInput,
      detailMeetingId: detailMeetingId,
    },
    enable: !!shouldFetch && !!detailMeetingId,
  });

  const isConclusion =
    meetingResponse?.state.activeTab === "CONCLUSION" ||
    meetingStatus === "ENDED";

  const { data: conclusionData, isLoading: conclusionLoading } =
    useGetMeetingConclusion({
      filter: {
        meetingId: meetingId,
      },
      enable: !!meetingId && !!isConclusion,
    });

  // Mutations
  const { mutate: deleteObjective } = deleteMeetingObjectiveMutation();
  const { mutate: addIssueAgenda } = addMeetingAgendaMutation();
  const { mutate: updateDetailMeeting } = updateDetailMeetingMutation();
  const { mutate: editMeetingAgendaTIming } = editAgendaTimingMeetingMutation();
  const { mutate: addIssue } = addUpdateIssues();
  const { mutate: addObjective } = addUpdateObjective();
  const { mutate: createMeet, isPending } = createMeetingMutation();
  const { mutate: endMeet, isPending: endMeetingLoading } =
    endMeetingMutation();
  const { mutate: updateTime } = addMeetingTimeMutation();

  const handleStartMeeting = () => {
    if (meetingId) {
      createMeet(meetingId, {
        onSuccess: () => {
          handleStartMeetingWithSidebar();
          // const startTime = Date.now();
          // setMeetingStartTime(startTime);
        },
      });
    }
  };

  const handleStartMeetingWithSidebar = () => {
    if (sidebarControl?.setOpen) {
      sidebarControl.setOpen(false);
    }
  };

  useEffect(() => {
    setAgendaList(selectedAgenda || []);
    if (selectedAgenda) {
      dispatch(setMeeting(selectedAgenda));
    }
  }, [dispatch, selectedAgenda]);

  useEffect(() => {
    if (meetingStatus === "STARTED" || meetingStatus === "NOT_STARTED") {
      setIsSideBar(false);
    } else {
      setIsSideBar(true);
    }
  }, [meetingStatus]);

  useEffect(() => {
    if (meetingResponse?.state.lastSwitchTimestamp) {
      const interval = setInterval(() => {
        // const now = Date.now();
        // setElapsed(now - Number(meetingResponse.state.lastSwitchTimestamp));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [meetingResponse?.state.lastSwitchTimestamp]);

  const handleCheckMeetingExist = useCallback(() => {
    const meetingRef = ref(db, `meetings/${meetingId}/state/updatedAt`);

    const unsubscribe = onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        setIsMeetingStart(true);
      } else {
        setIsMeetingStart(false);
      }
    });

    return () => unsubscribe();
  }, [db, meetingId]);

  const startEdit = (
    type: "issue" | "objective",
    id: string,
    value: string,
    plannedTime: string | number | null | undefined,
    detailMeetingAgendaIssueId: string,
  ) => {
    if (!canEdit) return;
    const totalSeconds = plannedTime
      ? parseInt(String(plannedTime), 10) || 0
      : 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    setEditing({
      type,
      id,
      value,
      plannedMinutes: String(minutes),
      plannedSeconds: String(seconds),
      detailMeetingAgendaIssueId,
    });
  };

  const setEditingValue = (value: string) => {
    setEditing((prev) => ({ ...prev, value }));
  };

  const cancelEdit = () => {
    setEditing({
      type: null,
      id: null,
      value: "",
      plannedMinutes: "",
      plannedSeconds: "",
      detailMeetingAgendaIssueId: "",
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
    setHoverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setHoverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setHoverIndex(null);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedList = [...agendaList];
    const [removed] = updatedList.splice(draggedIndex, 1);
    updatedList.splice(index, 0, removed);

    setAgendaList(updatedList);
    setDraggedIndex(null);
    setHoverIndex(null);

    const payload = {
      detailMeetingAgendaIssueId: removed.detailMeetingAgendaIssueId,
      detailMeetingId: detailMeetingId,
      sequence: index + 1,
    };
    addIssueAgenda(payload, {
      onSuccess: () => {
        handleCheckMeetingExist();
        if (isMeetingStart) {
          update(meetStateRef, {
            updatedAt: Date.now(),
          });
        }
      },
    });
  };

  const handleAddIssue = () => {
    setModalIssue(issueInput);
    setModalOpen(true);
    setDropdownVisible(false);
  };

  const updateEdit = () => {
    if (!canEdit) return;
    if (!editing.type || !editing.id || !meetingId) return;

    if (editing.type === "issue") {
      addIssue(
        {
          issueId: editing.id,
          issueName: editing.value,
        },
        {
          onSuccess: () => {
            handleCheckMeetingExist();
            if (isMeetingStart) {
              update(meetStateRef, {
                updatedAt: Date.now(),
              });
            }
            // cancelEdit();
          },
        },
      );
    } else if (editing.type === "objective") {
      addObjective(
        {
          objectiveId: editing.id,
          objectiveName: editing.value,
        },
        {
          onSuccess: () => {
            handleCheckMeetingExist();
            if (isMeetingStart) {
              update(meetStateRef, {
                updatedAt: Date.now(),
              });
            }
          },
        },
      );
    }
  };

  useEffect(() => {
    const meetingRef = ref(db, `meetings/${meetingId}/state`);

    let previousUpdatedAt: number | null = null;

    const unsubscribe = onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        if (data.updatedAt && data.updatedAt !== previousUpdatedAt) {
          queryClient.resetQueries({
            queryKey: ["get-detail-meeting-agenda-issue-obj"],
          });
          cancelEdit();
          previousUpdatedAt = data.updatedAt;
        }
      }
    });

    return () => {
      unsubscribe(); // Clean up the listener
    };
  }, [db, meetingId]);

  const handleDelete = (item: MeetingAgenda) => {
    if (item && item.detailMeetingAgendaIssueId) {
      deleteObjective(item.detailMeetingAgendaIssueId, {
        onSuccess: () => {
          handleCheckMeetingExist();
          if (isMeetingStart) {
            update(meetStateRef, {
              updatedAt: Date.now(),
            });
          }
        },
      });
    }
  };

  const filteredIssues = (issueData?.data ?? []).filter(
    (item) =>
      item.name.toLowerCase().includes(issueInput.toLowerCase()) &&
      issueInput.trim() !== "",
  );

  const searchOptions = (issueData?.data ?? []).map((item) => ({
    name: item.name,
    id: item.id,
    type: item.type,
  }));

  const handleUpdateSelectedObjective = (data: DetailMeetingObjectives) => {
    const payload = {
      detailMeetingId: detailMeetingId,
      issueObjectiveId: data.id,
      meetingId: meetingId,
      agendaType: data.type,
    };
    addIssueAgenda(payload, {
      onSuccess: () => {
        handleCheckMeetingExist();
        if (isMeetingStart) {
          update(meetStateRef, {
            updatedAt: Date.now(),
          });
        }
        setIssueInput("");
        setAddIssueModal(false);
      },
    });
  };

  const handleModalSubmit = (data: { type: string; value: string }) => {
    if (data.type === "issue") {
      addIssue(
        {
          issueName: data.value,
        },
        {
          onSuccess: (res) => {
            const payload = {
              detailMeetingId: detailMeetingId,
              issueObjectiveId: res.data.issueId,
              meetingId: meetingId,
              agendaType: "issue",
            };
            addIssueAgenda(payload, {
              onSuccess: () => {
                handleCheckMeetingExist();
                if (isMeetingStart) {
                  update(meetStateRef, {
                    updatedAt: Date.now(),
                  });
                }
                setIssueInput("");
                // queryClient.resetQueries({
                //   queryKey: ["get-detail-meeting-agenda-issue-obj"],
                // });
                // cancelEdit();
                setModalOpen(false);
                setAddIssueModal(false);
              },
            });
          },
        },
      );
    } else if (data.type === "objective") {
      addObjective(
        {
          objectiveName: data.value,
        },
        {
          onSuccess: (res) => {
            const payload = {
              detailMeetingId: detailMeetingId,
              issueObjectiveId: res.data.objectiveId,
              meetingId: meetingId,
              agendaType: "objective",
            };

            addIssueAgenda(payload, {
              onSuccess: () => {
                handleCheckMeetingExist();
                if (isMeetingStart) {
                  update(meetStateRef, {
                    updatedAt: Date.now(),
                  });
                  cancelEdit();
                  setModalOpen(false);
                }
                setIssueInput("");
                setAddIssueModal(false);
              },
            });
          },
        },
      );
    }
  };

  const handleTimeUpdate = (newTime: number) => {
    if (meetingId) {
      updateDetailMeeting(
        {
          meetingId: meetingId,
          detailMeetingId: detailMeetingId,
          meetingTimePlanned: String(newTime),
        },
        {
          onSuccess: () => {
            queryClient.resetQueries({
              queryKey: ["get-meeting-details-timing"],
            });
          },
        },
      );
    }
  };

  const handleConclusionMeeting = async () => {
    if (!meetingId) return;

    const db = getDatabase();
    const now = Date.now();
    const elapsedSeconds =
      (now - Number(meetingResponse?.state.lastSwitchTimestamp)) / 1000;

    if (isSelectedAgenda) {
      const currentActualTime =
        meetingResponse?.timers.objectives?.[isSelectedAgenda]?.actualTime || 0;
      const newActualTime = currentActualTime + elapsedSeconds;

      await update(
        ref(db, `meetings/${meetingId}/timers/objectives/${isSelectedAgenda}`),
        {
          actualTime: newActualTime,
          updatedAt: now,
        },
      );

      await updateMeetingStatus(now);
    }

    setIsSelectedAgenda(meetingResponse?.state.currentAgendaItemId);
  };

  const updateMeetingStatus = async (timestamp: number) => {
    return new Promise<void>((resolve, reject) => {
      updateDetailMeeting(
        {
          meetingId: meetingId,
          status: "CONCLUSION",
        },
        {
          onSuccess: () => {
            editMeetingAgendaTIming(
              {
                meetingId: meetingId,
              },
              {
                onSuccess: () => {
                  const meetStateRef = ref(db, `meetings/${meetingId}/state`);
                  update(meetStateRef, {
                    activeTab: "CONCLUSION",
                    lastSwitchTimestamp: timestamp,
                    status: "CONCLUSION",
                    conclusionTimestamp: Date.now(),
                  }).then(() => {
                    queryClient.resetQueries({
                      queryKey: ["get-meeting-conclusion-res"],
                    });
                    resolve();
                  });
                },
                onError: reject,
              },
            );
          },
          onError: reject,
        },
      );
    });
  };

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
              currentAgendaItemId: agendaList[0].detailMeetingAgendaIssueId,
            });
            update(meetAgendaRef, {
              actualTime: String(totalAgendaTime),
            });
          },
        },
      );
    }
  };

  useEffect(() => {
    const objectives = meetingResponse?.timers?.objectives;
    if (objectives && isSelectedAgenda) {
      const actTab = objectives[isSelectedAgenda];
      setActiveTab(actTab?.activeTab as ActiveTab);
    }
  }, [isSelectedAgenda, meetingResponse]);

  const handleTabChange = (tab: ActiveTab) => {
    const meetTimersRef = ref(
      db,
      `meetings/${meetingId}/timers/objectives/${isSelectedAgenda}`,
    );
    handleCheckMeetingExist();
    if (isMeetingStart) {
      update(meetTimersRef, {
        activeTab: tab,
      });
    }

    setActiveTab(tab);
  };

  useEffect(() => {
    const db = getDatabase();
    const meetingRef = ref(
      db,
      `meetings/${meetingId}/timers/objectives/${isSelectedAgenda}`,
    );

    onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setActiveTab(data.activeTab);
      }
    });

    return () => {
      off(meetingRef);
    };
  }, [isSelectedAgenda, meetingId]);

  const handleListClick = async (detailMeetingAgendaIssueId: string) => {
    if (!detailMeetingAgendaIssueId || !meetingId) return;

    const db = getDatabase();
    const now = Date.now();

    handleCheckMeetingExist();

    if (isMeetingStart && isSelectedAgenda && meetingStatus === "DISCUSSION") {
      const prevElapsedSeconds =
        (now - Number(meetingResponse?.state.lastSwitchTimestamp)) / 1000;
      const prevObjectiveRef = ref(
        db,
        `meetings/${meetingId}/timers/objectives/${isSelectedAgenda}`,
      );

      const currentActualTime =
        meetingResponse?.timers.objectives?.[isSelectedAgenda]?.actualTime || 0;

      await update(prevObjectiveRef, {
        actualTime: currentActualTime + prevElapsedSeconds,
        lastSwitchTimestamp: now,
      });

      await update(ref(db, `meetings/${meetingId}/state`), {
        lastSwitchTimestamp: now,
        currentAgendaItemId: detailMeetingAgendaIssueId,
      });
      setIsSelectedAgenda(detailMeetingAgendaIssueId);
    } else {
      await update(ref(db, `meetings/${meetingId}/state`), {
        lastSwitchTimestamp: now,
        currentAgendaItemId: detailMeetingAgendaIssueId,
      });
      setIsSelectedAgenda(detailMeetingAgendaIssueId);
    }
  };

  const tasksFireBase = () => {
    if (meetingResponse?.state.status === "DISCUSSION" && isSelectedAgenda) {
      const db = getDatabase();
      const meetTaskRef = ref(
        db,
        `meetings/${meetingId}/timers/objectives/${isSelectedAgenda}/tasks`,
      );
      update(meetTaskRef, {
        updatedAt: Date.now(),
      });
    }
  };

  const projectsFireBase = () => {
    if (meetingResponse?.state.status === "DISCUSSION" && isSelectedAgenda) {
      const db = getDatabase();
      const meetTaskRef = ref(
        db,
        `meetings/${meetingId}/timers/objectives/${isSelectedAgenda}/projects`,
      );
      update(meetTaskRef, {
        updatedAt: Date.now(),
      });
    }
  };

  const kpisFireBase = () => {
    if (meetingResponse?.state.status === "DISCUSSION" && isSelectedAgenda) {
      const db = getDatabase();
      const meetTaskRef = ref(
        db,
        `meetings/${meetingId}/timers/objectives/${isSelectedAgenda}/kpis`,
      );
      update(meetTaskRef, {
        updatedAt: Date.now(),
      });
    }
  };

  useEffect(() => {
    if (meetingStatus === "CONCLUSION" && meetingResponse === null) {
      handleCheckMeetingExist();
      if (isMeetingStart) {
        queryClient.resetQueries({
          queryKey: ["get-meeting-details-timing"],
        });
      }
    }
  }, [handleCheckMeetingExist, isMeetingStart, meetingResponse, meetingStatus]);

  const handleCloseMeetingWithLog = () => {
    // const now = Date.now();

    // const prevElapsedSeconds = meetingConclusionTime
    //   ? (now - meetingConclusionTime) / 1000
    //   : undefined;
    if (meetingId && detailMeetingId) {
      endMeet(meetingId);
    }
  };

  const hasChanges = (item: AgendaResConclusion | null) => {
    if (!item) return false;

    return (
      (item.discussion.taskUpdate && item.discussion.taskUpdate.length > 0) ||
      (item.discussion.projectUpdate &&
        item.discussion.projectUpdate.length > 0) ||
      (item.discussion.kpiUpdate && item.discussion.kpiUpdate.length > 0)
    );
  };

  useEffect(() => {
    const foundItem =
      conclusionData?.agenda?.find(
        (item) => item.detailMeetingAgendaIssueId === isSelectedAgenda,
      ) || null;
    setSelectedItem(foundItem);
  }, [conclusionData, isSelectedAgenda]);

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
            handleCheckMeetingExist();
            if (isMeetingStart) {
              const db = getDatabase();
              const meetRef = ref(db, `meetings/${meetingId}/state`);
              update(meetRef, { updatedAt: new Date() });
            }
          },
        },
      );
    }
  };

  const handleAddAgendaModal = () => {
    setAddIssueModal(true);
  };

  return {
    issueInput,
    editing,
    modalOpen,
    modalIssue,
    dropdownVisible,
    agendaList,
    draggedIndex,
    hoverIndex,
    isSelectedAgenda,
    isSideBar,
    filteredIssues,
    searchOptions,
    setIssueInput,
    setEditingValue,
    setModalOpen,
    setModalIssue,
    setDropdownVisible,
    handleAddIssue,
    startEdit,
    cancelEdit,
    updateEdit,
    handleDelete,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleUpdateSelectedObjective,
    handleModalSubmit,
    handleTimeUpdate,
    handleConclusionMeeting,
    handleDesc,
    activeTab,
    handleTabChange,
    handleListClick,
    detailAgendaData,
    kpisFireBase,
    projectsFireBase,
    tasksFireBase,
    handleStartMeeting,
    isPending,
    handleCloseMeetingWithLog,
    endMeetingLoading,
    conclusionData,
    conclusionLoading,
    hasChanges,
    selectedItem,
    handleCheckIn,
    setActiveTab,
    handleAddAgendaModal,
    addIssueModal,
    setAddIssueModal,
    // handleJoinMeeting,
  };
};
