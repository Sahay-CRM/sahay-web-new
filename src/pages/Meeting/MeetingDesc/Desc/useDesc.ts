import {
  endMeetingMutation,
  useGetDetailMeetingAgenda,
} from "@/features/api/companyMeeting";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDatabase, ref, update } from "firebase/database";

interface DescProps {
  meetingResponse?: MeetingResFire | null;
  detailMeetingId: string | undefined;
}

export default function useDesc({
  meetingResponse,
  detailMeetingId,
}: DescProps) {
  const { id: meetingId } = useParams();
  const db = getDatabase();
  const meetStateRef = ref(db, `meetings/${meetingId}/state`);

  const { mutate: endMeet } = endMeetingMutation();

  const { data: allItems, isLoading } = useGetDetailMeetingAgenda({
    filter: {
      detailMeetingId: detailMeetingId,
    },
    enable: !!detailMeetingId,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (
      allItems &&
      meetingResponse?.state?.currentAgendaItemId &&
      allItems.length > 0
    ) {
      const idx = allItems.findIndex(
        (item) =>
          item.detailMeetingAgendaIssueId ===
          meetingResponse.state.currentAgendaItemId,
      );
      if (idx !== -1) setCurrentIndex(idx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingResponse?.state?.currentAgendaItemId]);

  const handleCloseMeetingWithLog = () => {
    if (meetingId) {
      endMeet(meetingId);
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
      setCurrentIndex(nextIndex);
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
      setCurrentIndex(prevIndex);
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
      setCurrentIndex(index);
    }
  };

  return {
    totalData: allItems?.length ?? 0,
    currentIndex,
    allItems,
    handleCloseMeetingWithLog,
    handleNextWithLog,
    handlePreviousWithLog,
    handleJump,
    isLoading,
  };
}
