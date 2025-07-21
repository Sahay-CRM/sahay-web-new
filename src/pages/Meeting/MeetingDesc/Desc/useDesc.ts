import {
  updateDetailMeetingMutation,
  useGetDetailMeetingAgenda,
  useGetDetailMeetingAgendaIssue,
} from "@/features/api/companyMeeting";
import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { getDatabase, off, onValue, ref, update } from "firebase/database";
import { queryClient } from "@/queryClient";

interface DescProps {
  meetingResponse?: MeetingResFire | null;
  detailMeetingId: string | undefined;
}

type ActiveTab = "tasks" | "projects" | "kpis";

export default function useDesc({
  meetingResponse,
  detailMeetingId,
}: DescProps) {
  const { id: meetingId } = useParams();
  const db = getDatabase();
  const meetStateRef = ref(db, `meetings/${meetingId}/state`);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { mutate: updateDetailMeeting } = updateDetailMeetingMutation();

  const { data: allItems, isLoading } = useGetDetailMeetingAgenda({
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

  const currentIndex =
    allItems?.findIndex(
      (item) =>
        item.detailMeetingAgendaIssueId ===
        meetingResponse?.state.currentAgendaItemId,
    ) ?? 0;

  const getCurrentItem = () => {
    const issueLength = allItems?.length ?? 0;
    if (currentIndex >= 0 && currentIndex < issueLength) {
      return allItems?.[currentIndex];
    }
    return undefined;
  };

  const currentItem = getCurrentItem() as MeetingAgenda;

  const [activeTab, setActiveTab] = useState<ActiveTab>();

  useEffect(() => {
    if (
      meetingResponse &&
      currentItem &&
      currentItem.detailMeetingAgendaIssueId
    ) {
      const actTab =
        meetingResponse?.timers.objectives?.[
          currentItem.detailMeetingAgendaIssueId
        ];

      setActiveTab(actTab?.activeTab as ActiveTab);
    }
  }, [currentItem, meetingResponse]);

  const handleConclusionMeeting = () => {
    if (meetingId) {
      const db = getDatabase();
      const meetStateRef = ref(db, `meetings/${meetingId}/state`);
      updateDetailMeeting(
        {
          meetingId: meetingId,
          status: "CONCLUSION",
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

  const handleNextWithLog = () => {
    if (allItems) {
      const nextIndex = Math.min(currentIndex + 1, allItems.length - 1);
      const nextItem = allItems[nextIndex];
      const currentItem = allItems[currentIndex];

      const now = Date.now();
      const elapsed = now - Number(meetingResponse?.state.lastSwitchTimestamp);

      if (currentItem && currentItem.detailMeetingAgendaIssueId) {
        const objectiveActualTime =
          meetingResponse?.timers.objectives?.[
            currentItem.detailMeetingAgendaIssueId
          ].actualTime;
        const time = (objectiveActualTime ?? 0) + elapsed;

        const meetTimersRef = ref(
          db,
          `meetings/${meetingId}/timers/objectives/${currentItem.detailMeetingAgendaIssueId}`,
        );

        update(meetTimersRef, {
          actualTime: time,
          updatedAt: Date.now(),
        });
      }

      if (nextItem) {
        update(meetStateRef, {
          lastSwitchTimestamp: Date.now(),
          currentAgendaItemId: nextItem.detailMeetingAgendaIssueId,
        });
      }
    }
  };

  const handlePreviousWithLog = () => {
    if (allItems) {
      const prevIndex = Math.max(currentIndex - 1, 0);
      const prevItem = allItems[prevIndex];

      const currentItem = allItems[currentIndex];

      const now = Date.now();
      const elapsed = now - Number(meetingResponse?.state.lastSwitchTimestamp);

      if (currentItem && currentItem.detailMeetingAgendaIssueId) {
        const objectiveActualTime =
          meetingResponse?.timers.objectives?.[
            currentItem.detailMeetingAgendaIssueId
          ].actualTime;
        const time = (objectiveActualTime ?? 0) + elapsed;

        const meetTimersRef = ref(
          db,
          `meetings/${meetingId}/timers/objectives/${currentItem.detailMeetingAgendaIssueId}`,
        );

        update(meetTimersRef, {
          actualTime: time,
          updatedAt: Date.now(),
        });
      }

      if (prevItem) {
        update(meetStateRef, {
          lastSwitchTimestamp: Date.now(),
          currentAgendaItemId: prevItem.detailMeetingAgendaIssueId,
        });
      }
    }
  };

  const handleJump = (index: number) => {
    if (allItems) {
      const prevItem = allItems[index];
      const currentItem = allItems[currentIndex];
      const now = Date.now();
      const elapsed = now - Number(meetingResponse?.state.lastSwitchTimestamp);

      if (currentItem && currentItem.detailMeetingAgendaIssueId) {
        const objectiveActualTime =
          meetingResponse?.timers.objectives?.[
            currentItem.detailMeetingAgendaIssueId
          ].actualTime;
        const time = (objectiveActualTime ?? 0) + elapsed;

        const meetTimersRef = ref(
          db,
          `meetings/${meetingId}/timers/objectives/${currentItem.detailMeetingAgendaIssueId}`,
        );

        update(meetTimersRef, {
          actualTime: time,
          updatedAt: Date.now(),
        });
      }

      if (prevItem) {
        update(meetStateRef, {
          lastSwitchTimestamp: Date.now(),
          currentAgendaItemId: prevItem.detailMeetingAgendaIssueId,
        });
      }
    }
  };

  const handleTabChange = (tab: ActiveTab) => {
    const meetTimersRef = ref(
      db,
      `meetings/${meetingId}/timers/objectives/${currentItem.detailMeetingAgendaIssueId}`,
    );

    update(meetTimersRef, {
      activeTab: tab,
    });

    setActiveTab(tab);
  };

  const tasksFireBase = () => {
    if (
      meetingResponse?.state.status === "DISCUSSION" &&
      currentItem?.detailMeetingAgendaIssueId
    ) {
      const db = getDatabase();
      const meetTaskRef = ref(
        db,
        `meetings/${meetingId}/timers/objectives/${currentItem.detailMeetingAgendaIssueId}/tasks`,
      );
      update(meetTaskRef, {
        updatedAt: Date.now(),
      });
    }
  };

  const projectsFireBase = () => {
    if (
      meetingResponse?.state.status === "DISCUSSION" &&
      currentItem?.detailMeetingAgendaIssueId
    ) {
      const db = getDatabase();
      const meetTaskRef = ref(
        db,
        `meetings/${meetingId}/timers/objectives/${currentItem.detailMeetingAgendaIssueId}/projects`,
      );
      update(meetTaskRef, {
        updatedAt: Date.now(),
      });
    }
  };

  const kpisFireBase = () => {
    if (
      meetingResponse?.state.status === "DISCUSSION" &&
      currentItem?.detailMeetingAgendaIssueId
    ) {
      const db = getDatabase();
      const meetTaskRef = ref(
        db,
        `meetings/${meetingId}/timers/objectives/${currentItem.detailMeetingAgendaIssueId}/kpis`,
      );
      update(meetTaskRef, {
        updatedAt: Date.now(),
      });
    }
  };

  const handleUpdatedRefresh = useCallback(async (type: string) => {
    const queryMap: Record<string, string[] | undefined> = {
      tasks: ["get-meeting-tasks-res"],
      projects: ["get-meeting-Project-res"],
      kpis: [
        "get-meeting-kpis-res",
        "get-kpi-dashboard-data",
        // "get-kpi-dashboard-structure",
      ],
    };

    const queryKeys = queryMap[type];

    if (queryKeys?.length) {
      await Promise.all(
        queryKeys.map((key) => queryClient.prefetchQuery({ queryKey: [key] })),
      );
    }
  }, []);

  useEffect(() => {
    if (!currentItem?.detailMeetingAgendaIssueId) return;

    const db = getDatabase();
    const paths = ["tasks", "projects", "kpis"] as const;

    const listeners: { type: string; ref: ReturnType<typeof ref> }[] =
      paths.map((type) => {
        const dataRef = ref(
          db,
          `meetings/${meetingId}/timers/objectives/${currentItem.detailMeetingAgendaIssueId}/${type}`,
        );

        onValue(dataRef, (snapshot) => {
          if (snapshot.exists()) {
            handleUpdatedRefresh(type);
          }
        });

        // onValue(dataRef, callback);
        return { type, ref: dataRef };
      });

    return () => {
      listeners.forEach(({ ref }) => off(ref));
    };
  }, [
    currentItem?.detailMeetingAgendaIssueId,
    handleUpdatedRefresh,
    meetingId,
  ]);

  return {
    totalData: allItems?.length ?? 0,
    currentIndex,
    allItems,
    handleConclusionMeeting,
    handleNextWithLog,
    handlePreviousWithLog,
    handleJump,
    isLoading,
    isSidebarCollapsed,
    currentItem,
    setIsSidebarCollapsed,
    detailAgendaData,
    handleTabChange,
    activeTab,
    tasksFireBase,
    projectsFireBase,
    kpisFireBase,
  };
}
