import {
  endMeetingMutation,
  useGetMeetingIssue,
  useGetMeetingObjective,
} from "@/features/api/companyMeeting";
import { useParams } from "react-router-dom";
import { useState } from "react";

export default function useDesc() {
  const { id: meetingId } = useParams();

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

  // Add currentIndex state and setter
  const [currentIndex, setCurrentIndex] = useState(0);

  // Combine all items for dropdown
  const allItems = [
    ...(issueData?.data?.map((item, idx) => ({
      label: `${item.agendaIssue || `#${idx + 1}`}`,
      index: idx,
    })) || []),
    ...(objectiveData?.data?.map((item, idx) => ({
      label: `${item.agendaObjective || `#${idx + 1}`}`,
      index: (issueData?.data?.length || 0) + idx,
    })) || []),
  ];

  const handleCloseMeetingWithLog = () => {
    if (meetingId) {
      endMeet(meetingId);
    }
  };

  // Expose currentIndex, setCurrentIndex, allItems
  return {
    issueData,
    objectiveData,
    totalData,
    currentIndex,
    setCurrentIndex,
    allItems,
    handleCloseMeetingWithLog,
  };
}
