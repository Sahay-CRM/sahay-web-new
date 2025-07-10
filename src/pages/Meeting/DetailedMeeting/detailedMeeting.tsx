import useDetailedMeeting from "./useDetailedMeeting";
import PageNotAccess from "@/pages/PageNoAccess";
import MeetingUi from "./MeetingUi";
import { useContext, useEffect } from "react";
import SidebarControlContext from "@/features/layouts/DashboardLayout/SidebarControlContext";
import { SpinnerIcon } from "@/components/shared/Icons";

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

  const joiner = Array.isArray(meetingData?.data.joiners)
    ? (meetingData.data.joiners as Joiners[]).find(
        (j) => j.employeeId === userId,
      )
    : undefined;
  const isTeamLeader = !!joiner?.isTeamLeader;
  const isJoinerNotTeamLeader = !!joiner && !joiner.isTeamLeader;

  const sidebarControl = useContext(SidebarControlContext);
  useEffect(() => {
    if (sidebarControl) {
      sidebarControl.setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isUserJoiner = !!joiner;

  if (!isUserJoiner) {
    return <div>You are not a participant in this meeting.</div>;
  }
  const isLoading = !meetingData; // or use a loading flag from your hook if available

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin">
          <SpinnerIcon />
        </div>
      </div>
    );
  }

  if (failureReason) {
    return <PageNotAccess />;
  }

  // Show message if user is joiner, not team leader, and meeting hasn't started
  if (isJoinerNotTeamLeader && !isMeetingStart) {
    return <div>Meeting is not started</div>;
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
        follow={meetingResponse?.follow}
      />
    </div>
  );
}
