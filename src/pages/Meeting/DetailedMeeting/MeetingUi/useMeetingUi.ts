import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDatabase, ref, update } from "firebase/database";
import { useSelector } from "react-redux";
import { getUserId } from "@/features/selectors/auth.selector";
import {
  addMeetingTimeMutation,
  addUpdateCompanyMeetingMutation,
} from "@/features/api/companyMeeting";
import { queryClient } from "@/queryClient";

interface UseMeetingUiOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meetingStart: any;
  isTeamLeader: boolean;
  meetingTiming?: MeetingDetailsTiming;
  meetingJoiners?: Joiners[] | string[];
}

export default function useMeetingUi({
  meetingStart,
  meetingTiming,
  meetingJoiners,
}: UseMeetingUiOptions) {
  const { id: meetingId } = useParams();
  const userId = useSelector(getUserId);

  const checkEmployee = meetingTiming?.employeeList;

  const { mutate: updateMeetingTeamLeader } = addUpdateCompanyMeetingMutation();

  const { mutate: updateTime } = addMeetingTimeMutation();

  const TAB_NAMES = [
    "agenda",
    "tasks",
    "projects",
    "kpis",
    "conclusion",
  ] as const;

  const TAB_TO_TIMING_KEY: Record<string, keyof MeetingDetailsTiming> = {
    agenda: "agendaTimePlanned",
    tasks: "discussionTaskTimePlanned",
    projects: "discussionProjectTimePlanned",
    kpis: "discussionKPITimePlanned",
    conclusion: "conclusionTimePlanned",
  };

  function getLocalStorageMinutes(
    meetingId: string | undefined,
    tab: string,
  ): number {
    if (!meetingId) return 1;
    const stored = localStorage.getItem(`meeting-${meetingId}-timer-${tab}`);
    return stored ? parseInt(stored) : 1;
  }

  const [timerMinutesMap, setTimerMinutesMap] = useState<
    Record<string, number>
  >(() => {
    const defaultTimes: Record<string, number> = {};
    TAB_NAMES.forEach((tab) => {
      const timingKey = TAB_TO_TIMING_KEY[tab];
      if (meetingTiming && meetingTiming[timingKey]) {
        defaultTimes[tab] = Math.floor(Number(meetingTiming[timingKey]) / 60);
      } else {
        defaultTimes[tab] = getLocalStorageMinutes(meetingId, tab);
      }
    });
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
    const newTimerMinutesMap: Record<string, number> = {};
    TAB_NAMES.forEach((tab) => {
      const timingKey = TAB_TO_TIMING_KEY[tab];
      if (meetingTiming && meetingTiming[timingKey]) {
        newTimerMinutesMap[tab] = Math.floor(
          Number(meetingTiming[timingKey]) / 60,
        );
      } else {
        newTimerMinutesMap[tab] = getLocalStorageMinutes(meetingId, tab);
      }
    });
    setTimerMinutesMap(newTimerMinutesMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingTiming, meetingId]);

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
    updateMeetingTeamLeader(payload, {
      onSuccess: () => {
        queryClient.resetQueries({ queryKey: ["get-meeting-details-timing"] });
      },
    });
  };

  const handleCheckIn = (employeeId: string) => {
    if (meetingId) {
      updateTime({
        meetingId: meetingId,
        employeeId: employeeId,
        attendanceMark: true,
      });
    }
  };

  const handleCheckOut = (employeeId: string) => {
    if (meetingId) {
      updateTime({
        meetingId: meetingId,
        employeeId: employeeId,
        attendanceMark: false,
      });
    }
    // setCheckedInMap((prev) => ({ ...prev, [employeeId]: false }));
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
    handleCheckIn,
    handleCheckOut,
    checkEmployee,
  };
}
