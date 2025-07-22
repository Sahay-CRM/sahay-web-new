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
    // meetingData,
    meetingId,
    meetingResponse,
    meetingTiming,
    isMeetingStart,
  } = useMeetingDesc();
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Meeting", href: "/dashboard/meeting" },
      { label: "Meeting Detail", href: "" },
      { label: `${meetingTiming?.meetingName}`, href: "" },
    ]);
  }, [meetingTiming?.meetingName, setBreadcrumbs]);

  let content = null;
  if (meetingStatus === "NOT_STARTED" || meetingStatus === "STARTED") {
    content = (
      <Agenda
        meetingId={meetingId ?? ""}
        meetingStatus={meetingStatus}
        meetingResponse={meetingResponse}
        agendaPlannedTime={meetingTiming?.agendaTimePlanned}
        detailMeetingId={meetingTiming?.detailMeetingId}
        handleStartMeeting={handleStartMeeting}
        handleDesc={handleDesc}
        joiners={meetingTiming?.employeeList ?? []}
        meetingStart={isMeetingStart}
      />
    );
  } else if (meetingStatus === "DISCUSSION") {
    content = (
      <Desc
        meetingStatus={meetingStatus}
        meetingResponse={meetingResponse}
        detailMeetingId={meetingTiming?.detailMeetingId}
        meetingId={meetingId ?? ""}
      />
    );
  } else if (meetingStatus === "CONCLUSION" || meetingStatus === "ENDED") {
    content = (
      <Conclusion
        meetingStatus={meetingStatus}
        meetingResponse={meetingResponse}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex gap-2 justify-end"></div>
      <div>{content}</div>
    </div>
  );
}
