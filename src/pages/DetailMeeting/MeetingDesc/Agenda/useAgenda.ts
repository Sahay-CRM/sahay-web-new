import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { get, off, onValue, ref, update } from "firebase/database";
import { database } from "@/firebaseConfig";

import { addUpdateIssues } from "@/features/api/Issues";
import { addUpdateObjective } from "@/features/api/Objective";
import { queryClient } from "@/queryClient";
import { setMeeting } from "@/features/reducers/common.reducer";
import useGetMeetingConclusion from "@/features/api/detailMeeting/useGetMeetingConclusion";
// import SidebarControlContext from "@/features/layouts/DashboardLayout/SidebarControlContext";
import {
  addMeetingAgendaMutation,
  addMeetingTimeMutation,
  createIoMutation,
  createMeetingMutation,
  deleteMeetingObjectiveMutation,
  editAgendaTimingMeetingMutation,
  endMeetingMutation,
  updateDetailMeetingMutation,
  updateIoSequenceMutation,
  useGetDetailMeetingAgenda,
  useGetDetailMeetingAgendaIssue,
  useGetDetailMeetingObj,
  useGetMeetingConclusionTime,
} from "@/features/api/detailMeeting";
import { getUserId } from "@/features/selectors/auth.selector";
import { DragEndEvent } from "@dnd-kit/core";

interface UseAgendaProps {
  meetingId: string;
  meetingStatus?: string;
  meetingResponse?: MeetingResFire | null;
  canEdit: boolean;
  joiners: Joiners[];
  isTeamLeader: boolean | undefined;
  follow?: boolean;
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
  const db = database;
  const meetStateRef = ref(db, `meetings/${meetingId}/state`);
  // const sidebarControl = useContext(SidebarControlContext);
  const userId = useSelector(getUserId);

  const [issueInput, setIssueInput] = useState("");
  const [editing, setEditing] = useState<EditingProps>({
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
  const [isSelectedAgenda, setIsSelectedAgenda] = useState<string>();
  const [isSideBar, setIsSideBar] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>();
  const [selectedItem, setSelectedItem] = useState<AgendaResConclusion | null>(
    null,
  );
  const [addIssueModal, setAddIssueModal] = useState(false);
  const [debouncedInput, setDebouncedInput] = useState(issueInput);
  const [resolutionFilter, setResolutionFilter] = useState<string>("UNSOLVED");
  const [selectedIoType, setSelectedIoType] = useState("ISSUE");
  const [ioType, setIoType] = useState("");

  // const unFollowId = meetingResponse?.state.unfollow;

  const unFollowByUser = meetingResponse?.state.unfollow?.[userId] ?? false;

  const { data: selectedAgenda } = useGetDetailMeetingAgenda({
    filter: {
      meetingId: meetingId,
      // isResolved: resolutionFilter === "SOLVED" ? true : false,
    },
    enable: !!meetingId,
  });

  useEffect(() => {
    if (
      meetingResponse &&
      !unFollowByUser &&
      meetingResponse.state.currentAgendaItemId !== isSelectedAgenda
    ) {
      const io = selectedAgenda?.find(
        (item) =>
          item.issueObjectiveId === meetingResponse.state.currentAgendaItemId,
      )?.ioType;
      setIsSelectedAgenda(meetingResponse.state.currentAgendaItemId);
      if (io) {
        setIoType(io);
      }
    }
  }, [isSelectedAgenda, meetingResponse, selectedAgenda, unFollowByUser]);

  // API hooks

  // useEffect(() => {
  //   if (!unFollowByUser) {
  //     const io = selectedAgenda?.find(
  //       (item) =>
  //         item.issueObjectiveId === meetingResponse?.state.currentAgendaItemId
  //     )?.ioType;
  //     setIoType(io!);
  //   }
  // }, [
  //   meetingResponse?.state.currentAgendaItemId,
  //   selectedAgenda,
  //   unFollowByUser,
  // ]);

  // const ioType =
  //   meetingStatus !== "ENDED"
  //     ? selectedAgenda?.find(
  //         (item) =>
  //           item.issueObjectiveId === meetingResponse?.state.currentAgendaItemId
  //       )?.ioType
  //     : selectedAgenda?.find((age) => age.issueObjectiveId === isSelectedAgenda)
  //         ?.ioType;

  // useEffect(() => {
  //   if (meetingResponse && !unFollowByUser) {
  //     const io =
  //       meetingStatus !== "ENDED"
  //         ? selectedAgenda?.find(
  //             (item) =>
  //               item.issueObjectiveId ===
  //               meetingResponse?.state.currentAgendaItemId
  //           )?.ioType
  //         : selectedAgenda?.find(
  //             (age) => age.issueObjectiveId === isSelectedAgenda
  //           )?.ioType;
  //     setIoType(io!);
  //   }
  // }, [
  //   isSelectedAgenda,
  //   meetingResponse,
  //   meetingStatus,
  //   selectedAgenda,
  //   unFollowByUser,
  // ]);

  // const unFollowByUser = meetingResponse?.state.unfollow?.[userId] ?? false;
  // console.log(ioType, "io", meetingResponse?.state, selectedItem);

  const isSameIo =
    meetingResponse?.state.currentAgendaItemId === isSelectedAgenda;

  const { data: detailAgendaData } = useGetDetailMeetingAgendaIssue({
    filter: {
      issueObjectiveId:
        meetingStatus !== "ENDED"
          ? !unFollowByUser && meetingResponse?.state.currentAgendaItemId
          : isSelectedAgenda,
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
      isSameIo &&
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
  const { mutate: UpdateIoSeq } = updateIoSequenceMutation();

  const handleStartMeeting = () => {
    if (meetingId) {
      createMeet(meetingId);
    }
  };

  // const handleStartMeetingWithSidebar = () => {
  //   if (sidebarControl?.setOpen) {
  //     sidebarControl.setOpen(false);
  //   }
  // };

  useEffect(() => {
    if (selectedAgenda && selectedAgenda) {
      let filteredData = selectedAgenda;

      if (resolutionFilter === "SOLVED") {
        filteredData = filteredData.filter((item) => item.isResolved === true);
      } else if (resolutionFilter === "UNSOLVED") {
        filteredData = filteredData.filter((item) => item.isResolved === false);
      }

      setAgendaList(filteredData);
      dispatch(setMeeting(selectedAgenda));
    } else {
      setAgendaList([]);
    }
  }, [dispatch, selectedAgenda, resolutionFilter]);

  useEffect(() => {
    if (meetingStatus === "STARTED" || meetingStatus === "NOT_STARTED") {
      setIsSideBar(false);
    } else {
      setIsSideBar(true);
    }
  }, [meetingStatus]);

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
          onSuccess: async () => {
            const meetingRef = ref(db, `meetings/${meetingId}`);
            const meetingSnapshot = await get(meetingRef);

            if (meetingSnapshot.exists()) {
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
          onSuccess: async () => {
            const meetingRef = ref(db, `meetings/${meetingId}`);
            const meetingSnapshot = await get(meetingRef);

            if (meetingSnapshot.exists()) {
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
          queryClient.invalidateQueries({
            queryKey: ["get-detail-meeting-agenda-issue-obj"],
          });
          cancelEdit();
          previousUpdatedAt = data.updatedAt;
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [db, meetingId]);

  const handleDelete = (item: MeetingAgenda) => {
    if (item && item.issueObjectiveId) {
      const payload = {
        ioType: item.ioType,
        issueObjectiveId: item.issueObjectiveId,
        meetingId: meetingId!,
      };

      deleteObjective(payload, {
        onSuccess: async () => {
          const meetingRef = ref(db, `meetings/${meetingId}`);
          const meetingSnapshot = await get(meetingRef);

          if (meetingSnapshot.exists()) {
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

  const handleUpdateSelectedObjective = (data: DetailMeetingObjectives) => {
    const payload = {
      meetingId: meetingId,
      id: data.id,
      ioType: data.ioType,
    };
    addIssueAgenda(payload, {
      onSuccess: async () => {
        const meetingRef = ref(db, `meetings/${meetingId}`);
        const meetingSnapshot = await get(meetingRef);
        if (meetingSnapshot.exists()) {
          update(meetStateRef, {
            updatedAt: Date.now(),
          });
          setIssueInput("");
          setAddIssueModal(false);
        } else {
          setIssueInput("");
          setAddIssueModal(false);
        }
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
          const db = database;
          const meetRef = ref(db, `meetings/${meetingId}/state`);
          update(meetRef, { updatedAt: Date.now() });
          setModalOpen(false);
          setAddIssueModal(false);
          // queryClient.resetQueries({
          //   queryKey: ["get-detail-meeting-agenda-issue-obj"],
          // });
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

    const db = database;
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
      const db = database;
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
    if (objectives && isSelectedAgenda && !unFollowByUser) {
      const actTab = objectives[isSelectedAgenda];
      setActiveTab(actTab?.activeTab as ActiveTab);
    }
  }, [isSelectedAgenda, meetingResponse, unFollowByUser]);

  const handleTabChange = async (tab: ActiveTab) => {
    if (unFollowByUser) {
      setActiveTab(tab);
    } else {
      const meetTimersRef = ref(
        db,
        `meetings/${meetingId}/timers/objectives/${isSelectedAgenda}`,
      );
      const meetingRef = ref(db, `meetings/${meetingId}`);
      const meetingSnapshot = await get(meetingRef);

      if (meetingSnapshot.exists() || !!unFollowByUser) {
        update(meetTimersRef, {
          activeTab: tab,
        });
        setActiveTab(tab);
      }
    }
  };

  useEffect(() => {
    const db = database;
    const meetingRef = ref(
      db,
      `meetings/${meetingId}/timers/objectives/${isSelectedAgenda}`,
    );

    onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (!unFollowByUser) {
          setActiveTab(data.activeTab);
        }
      }
    });

    return () => {
      off(meetingRef);
    };
  }, [isSelectedAgenda, meetingId, unFollowByUser]);

  const handleListClick = async (
    issueObjectiveId: string,
    isUnFollow: boolean,
  ) => {
    if (
      !issueObjectiveId ||
      !meetingId ||
      meetingStatus === "NOT_STARTED" ||
      meetingStatus === "STARTED"
    )
      return;

    const ioId = meetingResponse?.state.currentAgendaItemId;

    const db = database;
    const now = Date.now();

    const meetingRef = ref(db, `meetings/${meetingId}`);
    const meetingSnapshot = await get(meetingRef);

    if (
      (meetingStatus === "DISCUSSION" || meetingStatus === "CONCLUSION") &&
      meetingSnapshot.exists() &&
      !isUnFollow
    ) {
      // const prevElapsedSeconds =
      //   (now - Number(meetingResponse?.state.lastSwitchTimestamp)) / 1000;
      // const prevObjectiveRef = ref(
      //   db,
      //   `meetings/${meetingId}/timers/objectives/${ioId}`
      // );

      // const currentActualTime =
      //   meetingResponse?.timers.objectives?.[ioId!]?.actualTime || 0;
      setIoType("");

      const prevElapsedSeconds =
        (now - Number(meetingResponse?.state.lastSwitchTimestamp)) / 1000;
      const currentActualTime =
        meetingResponse?.timers.objectives?.[ioId!]?.actualTime || 0;

      // Create updates object for multi-path update
      await update(ref(db), {
        [`meetings/${meetingId}/timers/objectives/${ioId}/actualTime`]:
          currentActualTime + prevElapsedSeconds,
        [`meetings/${meetingId}/timers/objectives/${ioId}/lastSwitchTimestamp`]:
          now,
        [`meetings/${meetingId}/state/lastSwitchTimestamp`]: now,
        [`meetings/${meetingId}/state/currentAgendaItemId`]: issueObjectiveId,
      });

      // await update(prevObjectiveRef, {
      //   actualTime: currentActualTime + prevElapsedSeconds,
      //   lastSwitchTimestamp: now,
      // });

      // await update(ref(db, `meetings/${meetingId}/state`), {
      //   lastSwitchTimestamp: now,
      //   currentAgendaItemId: issueObjectiveId,
      // });
      // setIsSelectedAgenda(issueObjectiveId);

      // const io =
      //   meetingStatus !== "ENDED"
      //     ? selectedAgenda?.find(
      //         (item) =>
      //           item.issueObjectiveId ===
      //           meetingResponse?.state.currentAgendaItemId
      //       )?.ioType
      //     : selectedAgenda?.find(
      //         (age) => age.issueObjectiveId === isSelectedAgenda
      //       )?.ioType;
      // setIoType(io!);
    }

    if (isUnFollow) {
      const io =
        (meetingStatus !== "ENDED" &&
          selectedAgenda?.find(
            (item) => item.issueObjectiveId === issueObjectiveId,
          )?.ioType) ||
        "";

      setIsSelectedAgenda(issueObjectiveId);
      setIoType(io);
      queryClient.resetQueries({ queryKey: ["get-meeting-tasks-res"] });
      queryClient.resetQueries({ queryKey: ["get-meeting-Project-res"] });
      queryClient.resetQueries({ queryKey: ["get-detailMeeting-kpis-res"] });
    } else if (meetingStatus === "ENDED") {
      const io =
        selectedAgenda?.find(
          (item) => item.issueObjectiveId === issueObjectiveId,
        )?.ioType || "";

      setIsSelectedAgenda(issueObjectiveId);
      setIoType(io);
      queryClient.resetQueries({ queryKey: ["get-meeting-tasks-res"] });
      queryClient.resetQueries({ queryKey: ["get-meeting-Project-res"] });
      queryClient.resetQueries({ queryKey: ["get-detailMeeting-kpis-res"] });
    }
  };

  const tasksFireBase = () => {
    if (meetingResponse?.state.status === "DISCUSSION" && isSelectedAgenda) {
      const db = database;
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
      const db = database;
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
      const db = database;
      const meetTaskRef = ref(
        db,
        `meetings/${meetingId}/timers/objectives/${isSelectedAgenda}/kpis`,
      );
      update(meetTaskRef, {
        updatedAt: Date.now(),
      });
    }
  };

  const handleCloseMeetingWithLog = () => {
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
      if (hasMarkedAttendance) return;

      const currentUser = joiners?.find((item) => item.employeeId === userId);

      if (
        userId &&
        currentUser &&
        !currentUser.attendanceMark &&
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
                const db = database;
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
              const db = database;
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
    const db = database;

    const meetingRef = ref(db, `meetings/${meetingId}`);
    const meetingSnapshot = await get(meetingRef);

    if (data.ioType === "ISSUE") {
      addIssue(
        {
          issueId: data.issueId,
          issueName: data.name,
          isResolved: !data.isResolved,
          meetingId: meetingId,
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
          meetingId: meetingId,
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
    if (
      meetingStatus === "NOT_STARTED" ||
      meetingStatus === "ENDED" ||
      unFollowByUser
    ) {
      setResolutionFilter(data);
    } else {
      const meetingRef = ref(db, `meetings/${meetingId}`);
      const meetingSnapshot = await get(meetingRef);

      if (meetingSnapshot.exists()) {
        await update(ref(db, `meetings/${meetingId}/state`), {
          agendaActiveTab: data,
          updatedAt: Date.now(),
        });
      }
    }
  };

  useEffect(() => {
    if (userId === "4b096369-dedc-4616-a3aa-51cb398f566a") return;
    const db = database;
    const meetingRef = ref(db, `meetings/${meetingId}/state/agendaActiveTab`);

    onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (unFollowByUser) return;
        if (data !== resolutionFilter) {
          setResolutionFilter(data);
        }
      }
    });

    return () => {
      off(meetingRef);
    };
  }, [meetingId, resolutionFilter, unFollowByUser, userId]);

  useEffect(() => {
    const hasRequiredData = meetingId && isSelectedAgenda;
    const isCurrentAgenda =
      meetingResponse?.state.currentAgendaItemId === isSelectedAgenda;

    if (!hasRequiredData || !isCurrentAgenda) {
      return;
    }

    // console.log(meetingResponse?.state.currentAgendaItemId, isSelectedAgenda);
    // console.log("ffff");

    const db = database;
    const objectiveRef = ref(
      db,
      `meetings/${meetingId}/timers/objectives/${isSelectedAgenda}/updatedAt`,
    );

    const unsubscribe = onValue(objectiveRef, (snapshot) => {
      if (
        !snapshot.exists() &&
        meetingResponse?.state.currentAgendaItemId !== isSelectedAgenda
      )
        return;

      // console.log(meetingResponse, isSelectedAgenda);

      queryClient.invalidateQueries({
        queryKey: ["get-detailMeetingAgendaIssue"],
      });
    });

    return () => {
      unsubscribe();
    };
  }, [meetingId, isSelectedAgenda, meetingResponse]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const draggedId = String(active.id);
      const dropIndex = Number(over?.data?.current?.sortable?.index) + 1;

      const ioType = agendaList.find(
        (item) => item.issueObjectiveId === draggedId,
      )?.ioType;

      const payload = {
        issueObjectiveId: draggedId,
        sequence: dropIndex,
        ioType: ioType!,
        meetingId: meetingId,
      };

      UpdateIoSeq(payload, {
        onSuccess: async () => {
          const meetingRef = ref(db, `meetings/${meetingId}`);
          const meetingSnapshot = await get(meetingRef);

          if (meetingSnapshot.exists()) {
            await update(ref(db, `meetings/${meetingId}/state`), {
              updatedAt: Date.now(),
            });
          } else {
            queryClient.invalidateQueries({
              queryKey: ["get-detail-meeting-agenda-issue-obj"],
            });
          }
        },
      });
    }
  };

  return {
    issueInput,
    editing,
    modalOpen,
    modalIssue,
    dropdownVisible,
    agendaList,
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
    handleDragEnd,
    unFollowByUser,
  };
};
