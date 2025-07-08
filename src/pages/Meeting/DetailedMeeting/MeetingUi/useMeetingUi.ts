import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDatabase, ref, update } from "firebase/database";
import { useSelector } from "react-redux";
import { getUserId } from "@/features/selectors/auth.selector";
import { addUpdateCompanyMeetingMutation } from "@/features/api/companyMeeting";

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
  meetingJoiners?: Joiners[] | string[];
}

export default function useMeetingUi({
  meetingStart,
  meetingTiming,
  meetingJoiners,
}: UseMeetingUiOptions) {
  const { id: meetingId } = useParams();
  const userId = useSelector(getUserId);

  const { mutate: updateMeetingTeamLeader } = addUpdateCompanyMeetingMutation();

  const TAB_NAMES = [
    "agenda",
    "tasks",
    "projects",
    "kpis",
    "conclusion",
  ] as const;

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
        defaultTimes.projects = Math.floor(
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
      const meetRef = ref(db, `meetings/${meetingId}/discussion/projects`);
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
        newTimerMinutesMap.projects = Math.floor(
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

      setTimerMinutesMap(newTimerMinutesMap);
    }
  }, [meetingTiming]);

  const handleAddTeamLeader = (data: Joiners) => {
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
    updateMeetingTeamLeader(payload);
  };

  return {
    meetingId,
    tabChangeFireBase,
    timerMinutesMap,
    tasksFireBase,
    conclusionFireBase,
    projectFireBase,
    kpisFireBase,
    setTimerMinutesMap,
    userId,
    handleAddTeamLeader,
  };
}
