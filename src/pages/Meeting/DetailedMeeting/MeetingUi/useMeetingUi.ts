import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDatabase, ref, update } from "firebase/database";

import {
  addAgendaObjectiveMutation,
  addMeetingAgendaMutation,
  deleteMeetingIssueMutation,
  deleteMeetingObjectiveMutation,
  useGetMeetingIssue,
  useGetMeetingObjective,
} from "@/features/api/companyMeeting";

interface UseMeetingUiOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meetingStart: any;
  isTeamLeader: boolean;
  meetingTiming?: {
    agendaTimePlanned?: string;
    discussionTaskTimePlanned?: string;
    discussionProjectTimePlanned?: string;
    discussionKPITimePlanned?: string;
    conclusionTimePlanned?: string;
  };
}

export default function useMeetingUi({
  isTeamLeader,
  meetingStart,
  meetingTiming,
}: UseMeetingUiOptions) {
  const { id: meetingId } = useParams();

  const [issueInput, setIssueInput] = useState("");
  const [objectiveInput, setObjectiveInput] = useState("");

  const TAB_NAMES = [
    "agenda",
    "tasks",
    "project",
    "kpis",
    "conclusion",
  ] as const;

  const [editing, setEditing] = useState<{
    type: "issue" | "objective" | null;
    id: string | null;
    value: string;
  }>({ type: null, id: null, value: "" });

  const { mutate: addIssueAgenda } = addMeetingAgendaMutation();
  const { mutate: addObjectiveAgenda } = addAgendaObjectiveMutation();

  const { mutate: deleteIssue } = deleteMeetingIssueMutation();
  const { mutate: deleteObjective } = deleteMeetingObjectiveMutation();

  const [timerMinutesMap, setTimerMinutesMap] = useState<
    Record<string, number>
  >(() => {
    const defaultTimes: Record<string, number> = {};
    TAB_NAMES.forEach((tab) => {
      defaultTimes[tab] = 1; // Default fallback
    });

    // Set from meetingTiming if available
    if (meetingTiming) {
      if (meetingTiming.agendaTimePlanned) {
        defaultTimes.agenda = Math.floor(
          Number(meetingTiming.agendaTimePlanned) / 60,
        );
      }
      if (meetingTiming.discussionTaskTimePlanned) {
        defaultTimes.tasks = Math.floor(
          Number(meetingTiming.discussionTaskTimePlanned) / 60,
        );
      }
      if (meetingTiming.discussionProjectTimePlanned) {
        defaultTimes.project = Math.floor(
          Number(meetingTiming.discussionProjectTimePlanned) / 60,
        );
      }
      if (meetingTiming.discussionKPITimePlanned) {
        defaultTimes.kpis = Math.floor(
          Number(meetingTiming.discussionKPITimePlanned) / 60,
        );
      }
      if (meetingTiming.conclusionTimePlanned) {
        defaultTimes.conclusion = Math.floor(
          Number(meetingTiming.conclusionTimePlanned) / 60,
        );
      }
    }

    return defaultTimes;
  });

  const { data: issueData } = useGetMeetingIssue({
    filter: {
      meetingId: meetingId,
    },
  });
  const { data: objectiveData } = useGetMeetingObjective({
    filter: {
      meetingId: meetingId,
    },
  });

  const canEdit = isTeamLeader;

  const handleDelete = (id: string, type: string) => {
    if (!canEdit) return;
    if (type === "Issue") {
      deleteIssue(id, {
        onSuccess: () => {
          agendaFireBase();
          setIssueInput("");
        },
      });
    } else if (type === "Objective") {
      deleteObjective(id, {
        onSuccess: () => {
          agendaFireBase();
          setIssueInput("");
        },
      });
    }
  };

  const handleAddIssue = () => {
    if (!canEdit) return;
    if (meetingId) {
      addIssueAgenda(
        {
          agendaIssue: issueInput,
          meetingId: meetingId,
        },
        {
          onSuccess: () => {
            agendaFireBase();
            setIssueInput("");
          },
        },
      );
    }
  };

  const handleAddObjective = () => {
    if (!canEdit) return;
    if (meetingId) {
      addObjectiveAgenda(
        {
          agendaObjective: objectiveInput,
          meetingId: meetingId,
        },
        {
          onSuccess: () => {
            agendaFireBase();
            setObjectiveInput("");
          },
        },
      );
    }
  };

  const startEdit = (
    type: "issue" | "objective",
    id: string,
    value: string,
  ) => {
    if (!canEdit) return;
    setEditing({ type, id, value });
  };

  const cancelEdit = () => {
    setEditing({ type: null, id: null, value: "" });
  };

  const updateEdit = () => {
    if (!canEdit) return;
    if (!editing.type || !editing.id || !meetingId) return;
    if (editing.type === "issue") {
      addIssueAgenda(
        {
          detailMeetingAgendaIssueId: editing.id,
          agendaIssue: editing.value,
          meetingId,
        },
        {
          onSuccess: () => {
            agendaFireBase();
            cancelEdit();
          },
        },
      );
    } else if (editing.type === "objective") {
      addObjectiveAgenda(
        {
          detailMeetingAgendaObjectiveId: editing.id,
          agendaObjective: editing.value,
          meetingId,
        },
        {
          onSuccess: () => {
            agendaFireBase();
            cancelEdit();
          },
        },
      );
    }
  };

  const setEditingValue = (value: string) => {
    setEditing((prev) => ({ ...prev, value }));
  };

  const agendaFireBase = () => {
    if (meetingStart) {
      const db = getDatabase();
      const meetRef = ref(db, `meetings/${meetingId}/agenda`);
      update(meetRef, {
        updatedAt: Date.now(),
      });
    }
  };

  // const discussionFireBase = () => {
  //   if (meetingResponse && meetingResponse !== null) {
  //     const db = getDatabase();
  //     const meetRef = ref(db, `meetings/${meetingId}/discussion`);
  //     update(meetRef, {
  //       updatedAt: Date.now(),
  //     });
  //   }
  // };

  const tasksFireBase = () => {
    if (meetingStart) {
      const db = getDatabase();
      const meetRef = ref(db, `meetings/${meetingId}/discussion/tasks`);
      update(meetRef, {
        updatedAt: Date.now(),
      });
    }
  };

  const projectFireBase = () => {
    if (meetingStart) {
      const db = getDatabase();
      const meetRef = ref(db, `meetings/${meetingId}/discussion/project`);
      update(meetRef, {
        updatedAt: Date.now(),
      });
    }
  };
  const kpisFireBase = () => {
    if (meetingStart) {
      const db = getDatabase();
      const meetRef = ref(db, `meetings/${meetingId}/discussion/kpis`);
      update(meetRef, {
        updatedAt: Date.now(),
      });
    }
  };

  const conclusionFireBase = () => {
    if (meetingStart) {
      const db = getDatabase();
      const meetRef = ref(db, `meetings/${meetingId}/conclusion`);
      update(meetRef, {
        updatedAt: Date.now(),
      });
    }
  };

  const tabChangeFireBase = useCallback(
    async (tab: string) => {
      tab = tab.toLowerCase();
      if (meetingStart) {
        const db = getDatabase();
        const meetRef = ref(db, `meetings/${meetingId}`);
        update(meetRef, {
          activeScreen: tab,
        });
      }
    },
    [meetingId, meetingStart],
  );

  useEffect(() => {
    if (meetingTiming) {
      const newTimerMinutesMap: Record<string, number> = {};

      if (meetingTiming.agendaTimePlanned) {
        newTimerMinutesMap.agenda = Math.floor(
          Number(meetingTiming.agendaTimePlanned) / 60,
        );
      }
      if (meetingTiming.discussionTaskTimePlanned) {
        newTimerMinutesMap.tasks = Math.floor(
          Number(meetingTiming.discussionTaskTimePlanned) / 60,
        );
      }
      if (meetingTiming.discussionProjectTimePlanned) {
        newTimerMinutesMap.project = Math.floor(
          Number(meetingTiming.discussionProjectTimePlanned) / 60,
        );
      }
      if (meetingTiming.discussionKPITimePlanned) {
        newTimerMinutesMap.kpis = Math.floor(
          Number(meetingTiming.discussionKPITimePlanned) / 60,
        );
      }
      if (meetingTiming.conclusionTimePlanned) {
        newTimerMinutesMap.conclusion = Math.floor(
          Number(meetingTiming.conclusionTimePlanned) / 60,
        );
      }

      setTimerMinutesMap((prev) => ({
        ...prev,
        ...newTimerMinutesMap,
      }));
    }
  }, [meetingTiming]);

  return {
    objectiveInput,
    issueInput,
    handleAddIssue,
    handleAddObjective,
    setIssueInput,
    setObjectiveInput,
    issueData,
    objectiveData,
    editing,
    startEdit,
    cancelEdit,
    updateEdit,
    setEditingValue,
    handleDelete,
    canEdit,
    meetingId,
    tabChangeFireBase,
    timerMinutesMap,
    tasksFireBase,
    conclusionFireBase,
    projectFireBase,
    kpisFireBase,
    setTimerMinutesMap,
  };
}
