import { Button } from "@/components/ui/button";
import useMeetingDesc from "./useMeetingDesc";
import Desc from "../MeetingDesc/Desc/desc";
import Conclusion from "../MeetingDesc/Conclusion/conclusion";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect } from "react";
import Agenda from "./Agenda";

export default function MeetingDesc() {
  const {
    handleStartMeeting,
    handleDesc,
    meetingStatus,
    meetingData,
    meetingId,
    meetingResponse,
    meetingTiming,
  } = useMeetingDesc();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Meeting", href: "/dashboard/meeting" },
      { label: "Meeting Detail", href: "" },
      { label: `${meetingData?.data.meetingName}`, href: "" },
    ]);
  }, [meetingData?.data.meetingName, setBreadcrumbs]);

  let content = null;
  if (meetingStatus === "NOT_STARTED" || meetingStatus === "STARTED") {
    content = (
      <Agenda
        meetingId={meetingId ?? ""}
        meetingStatus={meetingStatus}
        meetingResponse={meetingResponse}
        agendaPlannedTime={meetingTiming?.agendaTimePlanned}
        detailMeetingId={meetingTiming?.detailMeetingId}
      />
    );
  } else if (meetingStatus === "DISCUSSION") {
    content = (
      // <></>
      <Desc
        meetingStatus={meetingStatus}
        meetingResponse={meetingResponse}
        detailMeetingId={meetingTiming?.detailMeetingId}
      />
    );
  } else if (meetingStatus === "ENDED") {
    content = <Conclusion />;
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {/* Show Start/End Meeting button except on conclusion */}
        {meetingStatus === "NOT_STARTED" && (
          <Button
            variant="outline"
            className="bg-primary text-white cursor-pointer"
            onClick={handleStartMeeting}
          >
            Start Meeting
          </Button>
        )}
        {/* Show Desc button only after meeting started and not on conclusion */}
        {meetingStatus && meetingStatus === "STARTED" && (
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={handleDesc}
          >
            Desc
          </Button>
        )}
        {/* Show Agenda button if in desc and meeting started */}
      </div>
      <div>{content}</div>
    </div>
  );
}
