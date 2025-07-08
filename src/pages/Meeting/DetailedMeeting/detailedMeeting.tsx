import useDetailedMeeting from "./useDetailedMeeting";
import PageNotAccess from "@/pages/PageNoAccess";
import MeetingUi from "./MeetingUi";
import { useContext, useEffect } from "react";
import SidebarControlContext from "@/features/layouts/DashboardLayout/SidebarControlContext";

export default function DetailedMeeting() {
  const {
    meetingData,
    handleStartMeeting,
    failureReason,
    meetingResponse,
    isMeetingStart,
    userId,
    handleTabTimesUpdate,
    handleCloseMeetingWithLog,
    meetingTiming,
  } = useDetailedMeeting();

  const isTeamLeader =
    Array.isArray(meetingData?.data.joiners) &&
    (meetingData.data.joiners as Joiners[]).some(
      (joiner) => joiner.employeeId === userId && joiner.isTeamLeader,
    );

  const sidebarControl = useContext(SidebarControlContext);
  useEffect(() => {
    if (sidebarControl) {
      sidebarControl.setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failureReason) {
    return <PageNotAccess />;
  }

  return (
    <div>
      <div>{meetingResponse !== null && JSON.stringify(meetingResponse)}</div>
      <MeetingUi
        meetingStart={isMeetingStart}
        isTeamLeader={isTeamLeader}
        activeScreen={meetingResponse?.activeScreen}
        meetingEnded={!isMeetingStart === false}
        onTabTimesChange={handleTabTimesUpdate}
        meetingTiming={meetingTiming}
        meetingJoiners={meetingData?.data.joiners}
        handleStartMeeting={handleStartMeeting}
        handleCloseMeetingWithLog={handleCloseMeetingWithLog}
      />
    </div>
  );
}
