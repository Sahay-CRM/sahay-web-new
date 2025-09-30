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

  const parseCustomDate = (dateString: string): Date => {
    const [datePart, timePart] = dateString.split(" ");
    const [day, month, year] = datePart.split("/").map(Number);
    const [time, period] = timePart.split(" ");
    const [hours, minutes] = time.split(":").map(Number);

    // Convert to 24-hour format
    let hours24 = hours;
    if (period === "pm" && hours !== 12) {
      hours24 += 12;
    } else if (period === "am" && hours === 12) {
      hours24 = 0;
    }
    return new Date(year, month - 1, day, hours24, minutes);
  };

  const meetingDate = parseCustomDate(meeting.meetingDateTime);
  const currentDate = new Date();
  const isPast = meetingDate < currentDate;

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

  if (isPast && meeting.detailMeetingStatus === "NOT_STARTED") {
    buttonText = "Past Meeting";
    buttonColor = "bg-red-900";
  } else if (isPast) {
    buttonText = "Meeting Details";
    buttonColor = "bg-green-700";
  } else if (meeting.detailMeetingStatus === "ENDED") {
    buttonText = "Meeting Details";
    buttonColor = "bg-green-700";
  } else if (isTeamLeader && meeting.detailMeetingStatus === "NOT_STARTED") {
    buttonText = "Start Meeting";
    buttonColor = "";
  } else if (isTeamLeader && meeting.detailMeetingStatus === "STARTED") {
    buttonText = "Join Meeting";
    buttonColor = "bg-gray-700";
  } else if (meeting.detailMeetingStatus === "NOT_STARTED") {
    buttonText = "Not Started";
    buttonColor = "";
  }

  return {
    buttonText,
    buttonColor,
  };
};
