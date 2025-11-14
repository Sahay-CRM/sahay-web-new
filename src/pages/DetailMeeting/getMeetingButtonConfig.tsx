interface getMeetingButtonProps {
  userId: string;
  meeting: CompanyMeetingDataProps;
}

export const getMeetingButtonConfig = ({
  meeting,
  userId,
}: getMeetingButtonProps) => {
  if (!meeting.meetingDateTime) {
    return {
      buttonText: "Invalid Meeting",
      buttonColor: "bg-gray-500 hover:bg-gray-600 text-white",
      isDisabled: true,
      isPast: true,
      isTeamLeader: false,
    };
  }

  // Convert UTC string into local Date
  const meetingDate = new Date(meeting.meetingDateTime);
  const now = new Date();

  // Check if meeting date and time is in the past
  const isPast = meetingDate < now;

  // Check if meeting is on the same day as today
  const isSameDay =
    meetingDate.getFullYear() === now.getFullYear() &&
    meetingDate.getMonth() === now.getMonth() &&
    meetingDate.getDate() === now.getDate();

  // Check if current user is a team leader in this meeting
  const isTeamLeader = Array.isArray(meeting.joiners)
    ? meeting.joiners.some(
        (emp) =>
          emp &&
          typeof emp === "object" &&
          emp.employeeId === userId &&
          emp.isTeamLeader === true,
      )
    : false;

  let buttonText = "View Meeting";
  let buttonColor = "bg-blue-500 hover:bg-blue-600 text-white";

  // Logic for button text and color
  if (isPast && meeting.detailMeetingStatus === "NOT_STARTED") {
    buttonText = "Missed Meeting";
    buttonColor = "bg-red-900";
  } else if (meeting.detailMeetingStatus === "ENDED") {
    buttonText = "Meeting Details";
    buttonColor = "bg-green-700";
  } else if (isTeamLeader && meeting.detailMeetingStatus === "NOT_STARTED") {
    buttonText = "Start Meeting";
    buttonColor = "bg-blue-600 hover:bg-blue-700 text-white";
  } else if (isTeamLeader && meeting.detailMeetingStatus === "STARTED") {
    buttonText = "Join Meeting";
    buttonColor = "bg-gray-700 text-white";
  } else if (meeting.detailMeetingStatus === "NOT_STARTED") {
    // Meeting is today but time not passed yet
    buttonText = isSameDay && !isPast ? "Not Started" : "Not Started";
    buttonColor = "bg-yellow-500 text-white";
  } else if (
    meeting.detailMeetingStatus !== "NOT_STARTED" &&
    meeting.detailMeetingStatus !== "ENDED"
  ) {
    buttonText = "Join Meeting";
    buttonColor = "bg-blue-500 text-white";
  }

  return {
    buttonText,
    buttonColor,
    isPast,
    isSameDay,
    isTeamLeader,
  };
};
