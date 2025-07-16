import {
  endMeetingMutation,
  useGetMeetingIssue,
  useGetMeetingObjective,
} from "@/features/api/companyMeeting";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { setMeeting } from "@/features/reducers/common.reducer";
import { useDispatch } from "react-redux";
import { getDatabase, ref, update } from "firebase/database";

interface DescProps {
  meetingResponse?: MeetingResFire | null;
}

export default function useDesc({ meetingResponse }: DescProps) {
  const { id: meetingId } = useParams();
  const dispatch = useDispatch();
  const db = getDatabase();
  const meetStateRef = ref(db, `meetings/${meetingId}/state`);

  const { mutate: endMeet } = endMeetingMutation();

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

  const totalData =
    (issueData?.data?.length ?? 0) + (objectiveData?.data?.length ?? 0);

  const [currentIndex, setCurrentIndex] = useState(0);

  const allItems = [
    ...(issueData?.data?.map((item, idx) => ({
      label: `${item.agendaIssue || `#${idx + 1}`}`,
      id: `${item.detailMeetingAgendaIssueId}`,
      index: idx,
    })) || []),
    ...(objectiveData?.data?.map((item, idx) => ({
      label: `${item.agendaObjective || `#${idx + 1}`}`,
      id: `${item.detailMeetingAgendaObjectiveId}`,
      index: (issueData?.data?.length || 0) + idx,
    })) || []),
  ];

  useEffect(() => {
    if (meetingResponse?.state?.currentAgendaItemId && allItems.length > 0) {
      const idx = allItems.findIndex(
        (item) => item.id === meetingResponse.state.currentAgendaItemId,
      );
      if (idx !== -1) setCurrentIndex(idx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingResponse?.state?.currentAgendaItemId]);

  useEffect(() => {
    if (allItems) {
      dispatch(setMeeting(allItems));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCloseMeetingWithLog = () => {
    if (meetingId) {
      endMeet(meetingId);
    }
  };

  // Expose currentIndex, setCurrentIndex, allItems
  const handleNextWithLog = () => {
    const nextIndex = Math.min(currentIndex + 1, totalData - 1);
    const nextItem = allItems[nextIndex];
    if (nextItem) {
      update(meetStateRef, {
        lastSwitchTimestamp: Date.now(),
        currentAgendaItemId: nextItem.id,
      });
    }
    setCurrentIndex(nextIndex);
  };

  const handlePreviousWithLog = () => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    const prevItem = allItems[prevIndex];
    if (prevItem) {
      update(meetStateRef, {
        lastSwitchTimestamp: Date.now(),
        currentAgendaItemId: prevItem.id,
      });
    }
    setCurrentIndex(prevIndex);
  };

  const handleJump = (index: number) => {
    const prevItem = allItems[index];
    if (prevItem) {
      update(meetStateRef, {
        lastSwitchTimestamp: Date.now(),
        currentAgendaItemId: prevItem.id,
      });
    }
    setCurrentIndex(index);
  };

  return {
    issueData,
    objectiveData,
    totalData,
    currentIndex,
    allItems,
    handleCloseMeetingWithLog,
    handleNextWithLog,
    handlePreviousWithLog,
    handleJump,
  };
}
