import { endMeetingMutation } from "@/features/api/companyMeeting";
import useGetMeetingConclusion from "@/features/api/companyMeeting/useGetMeetingConclusion";
import { useParams } from "react-router-dom";

export default function useConclusion() {
  const { id: meetingId } = useParams();
  const { mutate: endMeet } = endMeetingMutation();
  const { data: conclusionData } = useGetMeetingConclusion(meetingId ?? "");

  const handleCloseMeetingWithLog = () => {
    if (meetingId) {
      endMeet(meetingId);
    }
  };

  return { handleCloseMeetingWithLog, conclusionData };
}
