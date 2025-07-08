import { Card } from "@/components/ui/card";
import useDetailedMeeting from "./useDetailedMeeting";
import { Button } from "@/components/ui/button";
import PageNotAccess from "@/pages/PageNoAccess";
import MeetingUi from "./MeetingUi";

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

  if (failureReason) {
    return <PageNotAccess />;
  }

  return (
    <div>
      <Card className="px-4 mb-3 h-52 overflow-hidden">
        <div className="flex gap-4 justify-between">
          <div className=" grid gap-3 grid-cols-2">
            <div>
              <span>Meeting Name: </span>
              <span className="font-semibold text-black">
                {meetingData?.data.meetingName}
              </span>
            </div>
            <div>
              <span>Meeting Description: </span>
              <span className="font-semibold text-black">
                {meetingData?.data.meetingDescription}
              </span>
            </div>
            <div>
              <span>Meeting Date: </span>
              <span className="font-semibold text-black">
                {meetingData?.data.meetingDateTime
                  ? new Date(
                      meetingData.data.meetingDateTime,
                    ).toLocaleDateString("en-GB")
                  : ""}
              </span>
            </div>
            <div>
              <span>Meeting Type: </span>
              <span className="font-semibold text-black">
                {meetingData?.data.meetingType?.meetingTypeName}
              </span>
            </div>
            <div>
              <span>Meeting Joiners: </span>
              <div>
                {Array.isArray(meetingData?.data.joiners) &&
                meetingData.data.joiners.length > 0 ? (
                  <ul className="list-disc pl-5 grid gap-x-10 grid-cols-2">
                    {(meetingData.data.joiners as Joiners[]).map((joiner) => (
                      <li key={joiner.employeeId}>
                        <span className="font-medium">
                          {joiner.employeeName}
                        </span>
                        {joiner.isTeamLeader && (
                          <span className="ml-2 text-xs text-blue-800 font-semibold">
                            (Team Leader)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span>No joiners</span>
                )}
              </div>
            </div>
          </div>
          <div>
            {Array.isArray(meetingData?.data.joiners) &&
            (meetingData.data.joiners as Joiners[]).some(
              (joiner) => joiner.employeeId === userId && joiner.isTeamLeader,
            ) ? (
              isMeetingStart ? (
                <Button
                  variant="outline"
                  className="cursor-pointer bg-red-800 text-white py-5 px-8 hover:bg-red-800/80 hover:text-white"
                  onClick={handleCloseMeetingWithLog}
                >
                  End Meeting
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="cursor-pointer bg-green-800 text-white py-5 px-8 hover:bg-green-800/80 hover:text-white"
                  onClick={handleStartMeeting}
                >
                  Start Meeting
                </Button>
              )
            ) : (
              <Button
                variant="outline"
                className="cursor-pointer bg-blue-800 text-white py-5 px-8 hover:bg-blue-800/80 hover:text-white"
                // onClick={handleStartMeeting}
              >
                Join Meeting
              </Button>
            )}
          </div>
        </div>
      </Card>
      <div>{meetingResponse !== null && JSON.stringify(meetingResponse)}</div>
      <MeetingUi
        meetingStart={isMeetingStart}
        isTeamLeader={isTeamLeader}
        activeScreen={meetingResponse?.activeScreen}
        meetingEnded={!isMeetingStart === false}
        onTabTimesChange={handleTabTimesUpdate}
        meetingTiming={meetingTiming}
      />
    </div>
  );
}
