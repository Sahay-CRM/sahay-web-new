import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  addMeetingAgendaMutation,
  deleteMeetingObjectiveMutation,
  editAgendaTimingMeetingMutation,
  updateDetailMeetingMutation,
  useGetDetailMeetingAgenda,
  useGetDetailMeetingAgendaIssue,
  useGetDetailMeetingObj,
} from "@/features/api/companyMeeting";
import { addUpdateIssues } from "@/features/api/Issues";
import { addUpdateObjective } from "@/features/api/Objective";
import { queryClient } from "@/queryClient";
import { setMeeting } from "@/features/reducers/common.reducer";
import { getDatabase, ref, update } from "firebase/database";

interface UseAgendaProps {
  meetingId: string;
  meetingStatus?: string;
  meetingResponse?: MeetingResFire | null;
  detailMeetingId: string | undefined;
  canEdit: boolean;
  currentIssueObjId?: string;
}

type ActiveTab = "tasks" | "projects" | "kpis";

export const useAgenda = ({
  meetingId,
  meetingStatus,
  meetingResponse,
  detailMeetingId,
  canEdit,
  currentIssueObjId,
}: UseAgendaProps) => {
  const dispatch = useDispatch();

  const db = getDatabase();
  // const meetStateRef = ref(db, `meetings/${meetingId}/state`);

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
  const [elapsed, setElapsed] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>();

  useEffect(() => {
    if (currentIssueObjId) {
      setIsSelectedAgenda(currentIssueObjId);
    }
  }, [currentIssueObjId]);

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

  // Mutations
  const { mutate: deleteObjective } = deleteMeetingObjectiveMutation();
  const { mutate: addIssueAgenda } = addMeetingAgendaMutation();
  const { mutate: updateDetailMeeting } = updateDetailMeetingMutation();
  const { mutate: editMeetingAgendaTIming } = editAgendaTimingMeetingMutation();
  const { mutate: addIssue } = addUpdateIssues();
  const { mutate: addObjective } = addUpdateObjective();

  useEffect(() => {
    setAgendaList(selectedAgenda || []);
    if (selectedAgenda) {
      dispatch(setMeeting(selectedAgenda));
    }
  }, [dispatch, selectedAgenda]);

  useEffect(() => {
    if (meetingStatus === "DISCUSSION") {
      setIsSideBar(true);
    }
  }, [meetingStatus]);

  useEffect(() => {
    if (meetingResponse?.state.lastSwitchTimestamp) {
      const interval = setInterval(() => {
        const now = Date.now();
        setElapsed(now - Number(meetingResponse.state.lastSwitchTimestamp));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [meetingResponse?.state.lastSwitchTimestamp]);

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
    addIssueAgenda(payload);
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
            queryClient.resetQueries({
              queryKey: ["get-detail-meeting-agenda-issue-obj"],
            });
            cancelEdit();
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
            queryClient.resetQueries({
              queryKey: ["get-detail-meeting-agenda-issue-obj"],
            });
          },
        },
      );
    }
  };

  const handleDelete = (item: MeetingAgenda) => {
    if (item && item.detailMeetingAgendaIssueId) {
      deleteObjective(item.detailMeetingAgendaIssueId);
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
        setIssueInput("");
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
                setIssueInput("");
                queryClient.resetQueries({
                  queryKey: ["get-detail-meeting-agenda-issue-obj"],
                });
                cancelEdit();
                setModalOpen(false);
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
                setIssueInput("");
                queryClient.resetQueries({
                  queryKey: ["get-detail-meeting-agenda-issue-obj"],
                });
                cancelEdit();
                setModalOpen(false);
              },
            });
          },
        },
      );
    }
  };

  const handleTimeUpdate = (newTime: number) => {
    if (meetingId) {
      updateDetailMeeting({
        meetingId: meetingId,
        detailMeetingId: detailMeetingId,
        meetingTimePlanned: String(newTime),
      });
    }
  };

  const handleConclusionMeeting = () => {
    if (meetingId) {
      const db = getDatabase();
      const meetStateRef = ref(db, `meetings/${meetingId}/state`);

      const now = Date.now();
      const elapsed = now - Number(meetingResponse?.state.lastSwitchTimestamp);

      if (isSelectedAgenda) {
        const objectiveActualTime =
          meetingResponse?.timers.objectives?.[isSelectedAgenda].actualTime;
        const time = (objectiveActualTime ?? 0) + elapsed;

        const meetTimersRef = ref(
          db,
          `meetings/${meetingId}/timers/objectives/${isSelectedAgenda}`,
        );

        update(meetTimersRef, {
          actualTime: time,
          updatedAt: Date.now(),
        });
      }

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
                  update(meetStateRef, {
                    activeTab: "CONCLUSION",
                    lastSwitchTimestamp: Date.now(),
                    status: "CONCLUSION",
                  });
                },
              },
            );
          },
        },
      );
    }
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

  const minutes = String(Math.floor(elapsed / 60000)).padStart(2, "0");
  const seconds = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, "0");
  const formattedTime = `${minutes}:${seconds}`;

  useEffect(() => {
    if (meetingResponse && isSelectedAgenda) {
      const actTab = meetingResponse?.timers.objectives?.[isSelectedAgenda];

      setActiveTab(actTab?.activeTab as ActiveTab);
    }
  }, [isSelectedAgenda, meetingResponse]);

  const handleTabChange = (tab: ActiveTab) => {
    const meetTimersRef = ref(
      db,
      `meetings/${meetingId}/timers/objectives/${isSelectedAgenda}`,
    );

    update(meetTimersRef, {
      activeTab: tab,
    });

    setActiveTab(tab);
  };

  const handleListClick = (detailMeetingAgendaIssueId: string) => {
    if (!detailMeetingAgendaIssueId || !meetingId) return;

    const now = Date.now();
    const db = getDatabase();

    // 1. Update the timer for the previously selected item (if any)
    if (isSelectedAgenda) {
      const prevElapsed =
        now - Number(meetingResponse?.state.lastSwitchTimestamp);
      const prevObjectiveRef = ref(
        db,
        `meetings/${meetingId}/timers/objectives/${isSelectedAgenda}`,
      );

      update(prevObjectiveRef, {
        actualTime:
          (meetingResponse?.timers.objectives?.[isSelectedAgenda]?.actualTime ||
            0) +
          prevElapsed / 1000,
        lastSwitchTimestamp: now,
      });
    }

    // 2. Switch to the new item
    update(ref(db, `meetings/${meetingId}/state`), {
      lastSwitchTimestamp: now,
      currentAgendaItemId: detailMeetingAgendaIssueId,
    });

    setIsSelectedAgenda(detailMeetingAgendaIssueId);
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
    formattedTime,
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
  };
};
