import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { get, getDatabase, off, onValue, ref, update } from "firebase/database";

import { addUpdateIssues } from "@/features/api/Issues";
import { addUpdateObjective } from "@/features/api/Objective";
import { queryClient } from "@/queryClient";
import { setMeeting } from "@/features/reducers/common.reducer";
import useGetMeetingConclusion from "@/features/api/detailMeeting/useGetMeetingConclusion";
import SidebarControlContext from "@/features/layouts/DashboardLayout/SidebarControlContext";
import {
  addMeetingAgendaMutation,
  addMeetingTimeMutation,
  createIoMutation,
  createMeetingMutation,
  deleteMeetingObjectiveMutation,
  editAgendaTimingMeetingMutation,
  endMeetingMutation,
  updateDetailMeetingMutation,
  useGetDetailMeetingAgenda,
  useGetDetailMeetingAgendaIssue,
  useGetDetailMeetingObj,
  useGetMeetingConclusionTime,
} from "@/features/api/detailMeeting";
import { getUserId } from "@/features/selectors/auth.selector";
// import { getUserId } from "@/features/selectors/auth.selector";

interface UseAgendaProps {
  meetingId: string;
  meetingStatus?: string;
  meetingResponse?: MeetingResFire | null;
  canEdit: boolean;
  joiners: Joiners[];
}

type ActiveTab = "tasks" | "projects" | "kpis";

export const useAgenda = ({
  meetingId,
  meetingStatus,
  meetingResponse,
  canEdit,
  joiners,
}: UseAgendaProps) => {
  const dispatch = useDispatch();
  const db = getDatabase();
  const meetStateRef = ref(db, `meetings/${meetingId}/state`);
  const sidebarControl = useContext(SidebarControlContext);
  const userId = useSelector(getUserId);

  const [issueInput, setIssueInput] = useState("");
  const [editing, setEditing] = useState<{
    type: "ISSUE" | "OBJECTIVE" | null;
    issueId: string | null;
    objectiveId: string | null;
    value: string;
    plannedMinutes: string;
    plannedSeconds: string;
    issueObjectiveId: string;
  }>({
    type: null,
    issueId: null,
    objectiveId: null,
    value: "",
    plannedMinutes: "",
    plannedSeconds: "",
    issueObjectiveId: "",
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
  const [debouncedInput, setDebouncedInput] = useState(issueInput);
  const [isMeetingStart, setIsMeetingStart] = useState(false);
  const [resolutionFilter, setResolutionFilter] = useState<string>("UNSOLVED");
  const [selectedIoType, setSelectedIoType] = useState("ISSUE");

  useEffect(() => {
    if (meetingResponse) {
      setIsSelectedAgenda(meetingResponse.state.currentAgendaItemId);
    }
  }, [meetingResponse]);

  // API hooks
  const { data: selectedAgenda } = useGetDetailMeetingAgenda({
    filter: {
      meetingId: meetingId,
      isResolved: resolutionFilter === "SOLVED" ? true : false,
    },
    enable: !!meetingId,
  });

  const ioType =
    meetingStatus !== "ENDED"
      ? selectedAgenda?.find(
          (item) =>
            item.issueObjectiveId ===
            meetingResponse?.state.currentAgendaItemId,
        )?.ioType
      : selectedAgenda?.find((age) => age.issueObjectiveId === isSelectedAgenda)
          ?.ioType;

  const { data: detailAgendaData } = useGetDetailMeetingAgendaIssue({
    filter: {
      issueObjectiveId:
        meetingResponse?.state.currentAgendaItemId || isSelectedAgenda,
      ...(ioType === "ISSUE"
        ? {
            issueId: selectedAgenda?.find(
              (item) => item.issueObjectiveId === isSelectedAgenda,
            )?.issueId,
          }
        : {
            objectiveId: selectedAgenda?.find(
              (item) => item.issueObjectiveId === isSelectedAgenda,
            )?.objectiveId,
          }),
      ioType: ioType,
    },

    enable:
      !!meetingResponse?.state.currentAgendaItemId &&
      !!ioType &&
      !!isSelectedAgenda,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInput(issueInput);
    }, 500); // 500ms delay after typing stops

    return () => {
      clearTimeout(handler);
    };
  }, [issueInput]);

  const shouldFetch = debouncedInput.length >= 3;

  const { data: issueData } = useGetDetailMeetingObj({
    filter: {
      search: issueInput,
      meetingId: meetingId,
      ...(meetingStatus !== "NOT_STARTED" && meetingStatus !== "STARTED"
        ? { ioType: selectedIoType }
        : {}),
    },
    enable: !!shouldFetch && !!meetingId,
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

  const { data: conclusionTime } = useGetMeetingConclusionTime({
    filter: {
      meetingId: meetingId,
    },
    enable: meetingResponse?.state.activeTab === "CONCLUSION" || !!meetingId,
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
  const { mutate: ioCreate } = createIoMutation();

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
    type: "ISSUE" | "OBJECTIVE",
    issueId: string | null,
    objectiveId: string | null,
    value: string,
    plannedTime: string | number | null | undefined,
    issueObjectiveId: string,
  ) => {
    if (!canEdit) return;
    const totalSeconds = plannedTime
      ? parseInt(String(plannedTime), 10) || 0
      : 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    setEditing({
      type,
      issueId,
      objectiveId,
      value,
      plannedMinutes: String(minutes),
      plannedSeconds: String(seconds),
      issueObjectiveId,
    });
  };

  const setEditingValue = (value: string) => {
    setEditing((prev) => ({ ...prev, value }));
  };

  const cancelEdit = () => {
    setEditing({
      type: null,
      objectiveId: null,
      issueId: null,
      value: "",
      plannedMinutes: "",
      plannedSeconds: "",
      issueObjectiveId: "",
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
      issueObjectiveId: removed.issueObjectiveId,
      meetingId: meetingId,
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
    if (!editing.type || !meetingId) return;

    if (editing.type === "ISSUE" && editing.issueId) {
      addIssue(
        {
          issueId: editing.issueId,
          issueName: editing.value,
        },
        {
          onSuccess: () => {
            handleCheckMeetingExist();
            if (isMeetingStart) {
              update(meetStateRef, {
                updatedAt: Date.now(),
              });
            } else {
              queryClient.resetQueries({
                queryKey: ["get-detail-meeting-agenda-issue-obj"],
              });
              cancelEdit();
            }
          },
        },
      );
    } else if (editing.type === "OBJECTIVE" && editing.objectiveId) {
      addObjective(
        {
          objectiveId: editing.objectiveId,
          objectiveName: editing.value,
        },
        {
          onSuccess: () => {
            handleCheckMeetingExist();
            if (isMeetingStart) {
              update(meetStateRef, {
                updatedAt: Date.now(),
              });
            } else {
              queryClient.resetQueries({
                queryKey: ["get-detail-meeting-agenda-issue-obj"],
              });
              cancelEdit();
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
    if (item && item.issueObjectiveId) {
      const payload = {
        ioType: item.ioType,
        issueObjectiveId: item.issueObjectiveId,
      };

      deleteObjective(payload, {
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
    ioType: item.ioType,
  }));

  const handleUpdateSelectedObjective = async (
    data: DetailMeetingObjectives,
  ) => {
    const meetingRef = ref(db, `meetings/${meetingId}`);
    const meetingSnapshot = await get(meetingRef);
    const payload = {
      meetingId: meetingId,
      id: data.id,
      ioType: data.ioType,
    };
    addIssueAgenda(payload, {
      onSuccess: () => {
        if (meetingSnapshot.exists()) {
          update(meetStateRef, {
            updatedAt: Date.now(),
          });
        }

        setIssueInput("");
        setAddIssueModal(false);
      },
    });
  };

  const handleModalSubmit = async (data: { type: string; value: string }) => {
    const meetingRef = ref(db, `meetings/${meetingId}`);
    const meetingSnapshot = await get(meetingRef);
    const payload = {
      meetingId: meetingId,
      name: data.value,
      ioType: data.type,
    };
    ioCreate(payload, {
      onSuccess: () => {
        if (!meetingSnapshot.exists()) {
          queryClient.resetQueries({
            queryKey: ["get-detail-meeting-agenda-issue-obj"],
          });
          setModalOpen(false);
          setAddIssueModal(false);
          setIssueInput("");
          return;
        } else {
          const db = getDatabase();
          const meetRef = ref(db, `meetings/${meetingId}/state`);
          update(meetRef, { updatedAt: new Date() });
          setModalOpen(false);
          setAddIssueModal(false);
          queryClient.resetQueries({
            queryKey: ["get-detail-meeting-agenda-issue-obj"],
          });
        }
      },
    });
    // if (data.type === "ISSUE") {
    //   addIssue(
    //     {
    //       issueName: data.value,
    //     },
    //     {
    //       onSuccess: (res) => {
    //         const payload = {
    //           meetingId: meetingId,
    //           issueObjectiveId: res.data.issueId,
    //           agendaType: "issue",
    //         };
    //         addIssueAgenda(payload, {
    //           onSuccess: () => {
    //             handleCheckMeetingExist();
    //             if (isMeetingStart) {
    //               update(meetStateRef, {
    //                 updatedAt: Date.now(),
    //               });
    //             }
    //             setIssueInput("");
    //             // queryClient.resetQueries({
    //             //   queryKey: ["get-detail-meeting-agenda-issue-obj"],
    //             // });
    //             // cancelEdit();
    //             setModalOpen(false);
    //             setAddIssueModal(false);
    //           },
    //         });
    //       },
    //     }
    //   );
    // } else if (data.type === "OBJECTIVE") {
    //   addObjective(
    //     {
    //       objectiveName: data.value,
    //     },
    //     {
    //       onSuccess: (res) => {
    //         const payload = {
    //           meetingId: meetingId,
    //           issueObjectiveId: res.data.objectiveId,
    //           agendaType: "objective",
    //         };

    //         addIssueAgenda(payload, {
    //           onSuccess: () => {
    //             handleCheckMeetingExist();
    //             if (isMeetingStart) {
    //               update(meetStateRef, {
    //                 updatedAt: Date.now(),
    //               });
    //               cancelEdit();
    //               setModalOpen(false);
    //             }
    //             setIssueInput("");
    //             setAddIssueModal(false);
    //           },
    //         });
    //       },
    //     }
    //   );
    // }
  };
  const [isUpdatingTime, setIsUpdatingTime] = useState(false);
  // const handleTimeUpdate = (newTime: number) => {
  //   if (meetingId) {
  //     updateDetailMeeting(
  //       {
  //         meetingId: meetingId,
  //         meetingId: meetingId,
  //         meetingTimePlanned: String(newTime),
  //       },
  //       {
  //         onSuccess: () => {
  //           queryClient.resetQueries({
  //             queryKey: ["get-meeting-details-timing"],
  //           });
  //         },
  //       }
  //     );
  //   }
  // };
  const handleTimeUpdate = async (newTime: number) => {
    if (!meetingId) return;

    setIsUpdatingTime(true);

    try {
      await new Promise((resolve, reject) => {
        updateDetailMeeting(
          {
            meetingId: meetingId,
            meetingTimePlanned: String(newTime),
          },
          {
            onSuccess: () => {
              // Invalidate and refetch queries
              queryClient.invalidateQueries({
                queryKey: ["get-meeting-details-timing"],
              });
              resolve(undefined);
            },
            onError: reject,
          },
        );
      });
      // eslint-disable-next-line no-useless-catch
    } catch (error) {
      throw error; // Re-throw to let the component handle it
    } finally {
      setIsUpdatingTime(false);
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
          detailMeetingStatus: "CONCLUSION",
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
                    // queryClient.resetQueries({
                    //   queryKey: ["get-meeting-conclusion-time-by-meetingId"],
                    // });

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
    if (!agendaList || agendaList.length === 0) {
      // eslint-disable-next-line no-alert
      window.alert("Please add an issue objective before starting discussion.");
      return;
    }

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
          detailMeetingStatus: "DISCUSSION",
          agendaTimeActual: String(totalAgendaTime / 1000),
        },
        {
          onSuccess: () => {
            update(meetStateRef, {
              activeTab: "DISCUSSION",
              lastSwitchTimestamp: Date.now(),
              status: "DISCUSSION",
              currentAgendaItemId: agendaList[0].issueObjectiveId,
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
      setActiveTab(tab);
    }
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

  const handleListClick = async (issueObjectiveId: string) => {
    const ioId = meetingResponse?.state.currentAgendaItemId;
    if (!issueObjectiveId || !meetingId) return;

    const db = getDatabase();
    const now = Date.now();

    const meetingRef = ref(db, `meetings/${meetingId}`);
    const meetingSnapshot = await get(meetingRef);

    if (
      ioId &&
      (meetingStatus === "DISCUSSION" || meetingStatus === "CONCLUSION")
    ) {
      if (!meetingSnapshot.exists()) {
        setIsSelectedAgenda(issueObjectiveId);
        return;
      } else {
        const prevElapsedSeconds =
          (now - Number(meetingResponse?.state.lastSwitchTimestamp)) / 1000;
        const prevObjectiveRef = ref(
          db,
          `meetings/${meetingId}/timers/objectives/${ioId}`,
        );

        const currentActualTime =
          meetingResponse?.timers.objectives?.[ioId]?.actualTime || 0;

        await update(prevObjectiveRef, {
          actualTime: currentActualTime + prevElapsedSeconds,
          lastSwitchTimestamp: now,
        });

        await update(ref(db, `meetings/${meetingId}/state`), {
          lastSwitchTimestamp: now,
          currentAgendaItemId: issueObjectiveId,
        });
        setIsSelectedAgenda(issueObjectiveId);
      }
    } else {
      // await update(ref(db, `meetings/${meetingId}/state`), {
      //   lastSwitchTimestamp: now,
      //   currentAgendaItemId: issueObjectiveId,
      // });
      setIsSelectedAgenda(issueObjectiveId);
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

  // useEffect(() => {
  //   if (meetingStatus === "CONCLUSION" && meetingResponse === null) {
  //     handleCheckMeetingExist();
  //     if (isMeetingStart) {
  //       queryClient.resetQueries({
  //         queryKey: ["get-meeting-details-timing"],
  //       });
  //     }
  //   }
  // }, [handleCheckMeetingExist, isMeetingStart, meetingResponse, meetingStatus]);

  const handleCloseMeetingWithLog = () => {
    // const now = Date.now();

    // const prevElapsedSeconds = meetingConclusionTime
    //   ? (now - meetingConclusionTime) / 1000
    //   : undefined;
    if (meetingId && meetingId) {
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
        (item) => item.issueObjectiveId === isSelectedAgenda,
      ) || null;
    setSelectedItem(foundItem);
  }, [conclusionData, isSelectedAgenda]);

  const [hasMarkedAttendance, setHasMarkedAttendance] = useState(false);

  useEffect(() => {
    const fetchAndMarkAttendance = async () => {
      if (hasMarkedAttendance) return; // prevent duplicate calls

      // ✅ find current user in joiners
      const currentUser = joiners?.find((item) => item.employeeId === userId);

      // ✅ check conditions
      if (
        userId &&
        currentUser &&
        !currentUser.attendanceMark && // only if false
        meetingStatus !== "NOT_STARTED" &&
        meetingStatus !== "ENDED"
      ) {
        const meetingRef = ref(db, `meetings/${meetingId}`);
        const meetingSnapshot = await get(meetingRef);

        updateTime(
          {
            meetingId,
            employeeId: userId,
            attendanceMark: true,
          },
          {
            onSuccess: () => {
              if (!meetingSnapshot.exists()) {
                queryClient.resetQueries({
                  queryKey: ["get-meeting-details-timing"],
                });
              } else {
                const db = getDatabase();
                const meetRef = ref(db, `meetings/${meetingId}/state`);
                update(meetRef, { updatedAt: Date.now() });
              }
              setHasMarkedAttendance(true); // ✅ ensure only once
            },
          },
        );
      }
    };

    fetchAndMarkAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    joiners,
    userId,
    meetingId,
    meetingStatus,
    updateTime,
    queryClient,
    hasMarkedAttendance,
  ]);

  const handleCheckIn = async (item: Joiners, attendanceMark: boolean) => {
    const meetingRef = ref(db, `meetings/${meetingId}`);
    const meetingSnapshot = await get(meetingRef);
    if (meetingId) {
      updateTime(
        {
          meetingId: meetingId,
          employeeId: item.employeeId,
          attendanceMark: attendanceMark,
          // updatedAt: new Date().toISOString(),
        },
        {
          onSuccess: () => {
            if (!meetingSnapshot.exists()) {
              queryClient.resetQueries({
                queryKey: ["get-meeting-details-timing"],
              });
              return;
            } else {
              const db = getDatabase();
              const meetRef = ref(db, `meetings/${meetingId}/state`);
              update(meetRef, { updatedAt: Date.now() });
            }
          },
        },
      );
    }
  };

  const handleAddAgendaModal = () => {
    setAddIssueModal(true);
  };

  const handleMarkAsSolved = async (data: MeetingAgenda) => {
    const db = getDatabase();

    const meetingRef = ref(db, `meetings/${meetingId}`);
    const meetingSnapshot = await get(meetingRef);

    if (data.ioType === "ISSUE") {
      addIssue(
        {
          issueId: data.issueId,
          issueName: data.name,
          isResolved: !data.isResolved,
        },
        {
          onSuccess: () => {
            if (!meetingSnapshot.exists()) {
              queryClient.resetQueries({
                queryKey: ["get-detail-meeting-agenda-issue-obj"],
              });
              return;
            } else {
              update(ref(db, `meetings/${meetingId}/state`), {
                updatedAt: Date.now(),
              });
            }
          },
        },
      );
    } else if (data.ioType === "OBJECTIVE") {
      addObjective(
        {
          objectiveId: data.objectiveId,
          objectiveName: data.name,
          isResolved: !data.isResolved,
        },
        {
          onSuccess: () => {
            if (!meetingSnapshot.exists()) {
              queryClient.resetQueries({
                queryKey: ["get-detail-meeting-agenda-issue-obj"],
              });
              return;
            } else {
              update(ref(db, `meetings/${meetingId}/state`), {
                updatedAt: Date.now(),
              });
            }
          },
        },
      );
    }
  };

  const handleAgendaTabFilter = async (data: string) => {
    const db = getDatabase();

    const meetingRef = ref(db, `meetings/${meetingId}`);
    const meetingSnapshot = await get(meetingRef);

    if (!meetingSnapshot.exists()) {
      setResolutionFilter(data);
      return;
    } else {
      await update(ref(db, `meetings/${meetingId}/state`), {
        agendaActiveTab: data,
        updatedAt: Date.now(),
      });
    }
  };

  useEffect(() => {
    const db = getDatabase();
    const meetingRef = ref(db, `meetings/${meetingId}/state/agendaActiveTab`);

    onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setResolutionFilter(data);
      }
    });

    return () => {
      off(meetingRef);
    };
  }, [meetingId]);

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
    isUpdatingTime,
    conclusionTime,
    ioType,
    setSelectedIoType,
    handleMarkAsSolved,
    handleAgendaTabFilter,
    resolutionFilter,
    // handleJoinMeeting,
  };
};
