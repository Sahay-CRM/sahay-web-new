import { useCallback } from "react";
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
  meetingStart: boolean;
  joiners?: Joiners[] | string[];
}

export default function useMeetingUi({
  meetingStart,
  joiners,
}: UseMeetingUiOptions) {
  const { id: meetingId } = useParams();
  const userId = useSelector(getUserId);

  const { mutate: updateMeetingTeamLeader } = addUpdateCompanyMeetingMutation();

  const { mutate: updateTime } = addMeetingTimeMutation();

  // const TAB_NAMES = [
  //   "agenda",
  //   "tasks",
  //   "projects",
  //   "kpis",
  //   "conclusion",
  // ] as const;

  // const TAB_TO_TIMING_KEY: Record<string, keyof MeetingDetailsTiming> = {
  //   agenda: "agendaTimePlanned",
  //   tasks: "discussionTaskTimePlanned",
  //   projects: "discussionProjectTimePlanned",
  //   kpis: "discussionKPITimePlanned",
  //   conclusion: "conclusionTimePlanned",
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

  const handleAddTeamLeader = (data: Joiners) => {
    const teamLeader = (joiners as Joiners[])
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
      updateTime(
        {
          meetingId: meetingId,
          employeeId: employeeId,
          attendanceMark: true,
          updatedAt: new Date().toISOString(),
        },
        {
          onSuccess: () => {
            if (meetingId) {
              const db = getDatabase();
              const meetRef = ref(db, `meetings/${meetingId}`);
              update(meetRef, { updatedAt: new Date().toISOString() });
            }
          },
        },
      );
    }
  };

  const handleCheckOut = (employeeId: string) => {
    if (meetingId) {
      updateTime(
        {
          meetingId: meetingId,
          employeeId: employeeId,
          attendanceMark: false,
          updatedAt: new Date().toISOString(),
        },
        {
          onSuccess: () => {
            if (meetingId) {
              const db = getDatabase();
              const meetRef = ref(db, `meetings/${meetingId}`);
              update(meetRef, { updatedAt: new Date().toISOString() });
            }
          },
        },
      );
    }
  };

  // Add handleFollow to update 'follow' field in Firebase
  const handleFollow = (employeeId: string) => {
    if (meetingId) {
      const db = getDatabase();
      const meetRef = ref(db, `meetings/${meetingId}`);
      update(meetRef, { follow: employeeId });
    }
  };

  return {
    meetingId,
    tabChangeFireBase,
    tasksFireBase,
    conclusionFireBase,
    projectFireBase,
    kpisFireBase,
    userId,
    handleAddTeamLeader,
    handleCheckIn,
    handleCheckOut,
    handleFollow, // Expose handleFollow
  };
}
