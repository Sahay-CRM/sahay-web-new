import { endMeetingMutation } from "@/features/api/companyMeeting";
import { useParams } from "react-router-dom";

export default function useConclusion() {
  const { id: meetingId } = useParams();

  const { mutate: endMeet } = endMeetingMutation();

  const handleCloseMeetingWithLog = () => {
    if (meetingId) {
      endMeet(meetingId);
    }
  };

  return { handleCloseMeetingWithLog };
}
