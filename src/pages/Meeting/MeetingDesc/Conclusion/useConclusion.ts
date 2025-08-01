import { endMeetingMutation } from "@/features/api/companyMeeting";
import useGetMeetingConclusion from "@/features/api/companyMeeting/useGetMeetingConclusion";
import { useState } from "react";
import { useParams } from "react-router-dom";

export default function useConclusion() {
  const { id: meetingId } = useParams();
  const [selectedAgenda, setSelectedAgenda] = useState(0);

  const { mutate: endMeet, isPending } = endMeetingMutation();
  const { data: conclusionData, isLoading } = useGetMeetingConclusion({
    filter: {
      meetingId: meetingId,
    },
    enable: !!meetingId,
  });

  const hasChanges = (item: AgendaResConclusion | undefined) => {
    if (!item) return;
    return (
      item.discussion.taskUpdate.length > 0 ||
      item.discussion.projectUpdate.length > 0 ||
      item.discussion.kpiUpdate.length > 0
    );
  };

  return {
    conclusionData,
    isPending,
    isLoading,
    setSelectedAgenda,
    selectedAgenda,
    hasChanges,
    endMeet,
    meetingId,
  };
}
