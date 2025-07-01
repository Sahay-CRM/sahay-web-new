import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { getDatabase, ref, onValue, off } from "firebase/database";

export default function StartMeeting() {
  const { id: tempMeetingId } = useParams();
  const [meetingData, setMeetingData] = useState(null);

  useEffect(() => {
    if (!tempMeetingId) return;
    const db = getDatabase();
    const meetingRef = ref(db, `meetings/${tempMeetingId}`);

    onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setMeetingData(data);
      } else {
        setMeetingData(null);
      }
    });

    return () => {
      off(meetingRef);
    };
  }, [tempMeetingId]);

  return (
    <div>
      <div>Start Meeting</div>
      <pre>{JSON.stringify(meetingData)}</pre>
    </div>
  );
}
