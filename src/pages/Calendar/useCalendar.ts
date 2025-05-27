export default function useCalendar() {
  // const { data: taskData } = useCompanyTask();

  const taskData = [
    {
      taskId: "b513908d-4eac-48a5-9355-08900b358722",
      taskName: "hggj",
      taskDescription: "hgjhgj",
      taskDeadline: "2025-05-21T11:28:00.000Z",
    },
    {
      taskId: "a87c28b3-e3d5-4f3c-b87e-6163b68bb2ed",
      taskName: "hnfjhgj",
      taskDescription: "hjhgj",
      taskDeadline: "2025-05-20T05:57:00.000Z",
    },
  ];

  const meetingData: MeetingData[] = [
    {
      meetingId: "m1",
      topic: "Team Sync",
      agenda: "Weekly updates and blockers",
      meetingDate: "2025-05-22T10:00:00.000Z",
    },
    {
      meetingId: "m2",
      topic: "Client Call",
      agenda: "Project discussion",
      meetingDate: "2025-05-23T14:00:00.000Z",
    },
  ];

  const importantDatesData: ImportantDateData[] = [
    {
      dateId: "d1",
      label: "Product Launch",
      note: "Go-live for v2.0",
      date: "2025-05-20T00:00:00.000Z",
    },
    {
      dateId: "d2",
      label: "Company Anniversary",
      note: "5 years celebration",
      date: "2025-05-30T00:00:00.000Z",
    },
  ];

  const transformTaskDataToEvents = (data: TaskData[]): EventData[] =>
    data.map((item) => {
      const deadline = item.taskDeadline ? new Date(item.taskDeadline) : null;

      return {
        title: item.taskName || "Task Name",
        description: item.taskDescription || "No description provided",
        start:
          deadline instanceof Date && !isNaN(deadline.getTime())
            ? deadline
            : new Date(),
        end:
          deadline instanceof Date && !isNaN(deadline.getTime())
            ? deadline
            : new Date(),
        eventId: item.taskId,
      };
    });

  const transformMeetingDataToEvents = (data: MeetingData[]): EventData[] =>
    data.map((item) => {
      const deadline = item.meetingDate ? new Date(item.meetingDate) : null;

      return {
        title: item.agenda || "Meeting Name",
        description: item.topic || "No Topic",
        start:
          deadline instanceof Date && !isNaN(deadline.getTime())
            ? deadline
            : new Date(),
        end:
          deadline instanceof Date && !isNaN(deadline.getTime())
            ? deadline
            : new Date(),
        eventId: item.meetingId,
      };
    });

  const transformImportantDateDataToEvents = (
    data: ImportantDateData[],
  ): EventData[] =>
    data.map((item) => {
      const deadline = item.date ? new Date(item.date) : null;

      return {
        title: item.label || "Important Date",
        description: item.note || "No Notes",
        start:
          deadline instanceof Date && !isNaN(deadline.getTime())
            ? deadline
            : new Date(),
        end:
          deadline instanceof Date && !isNaN(deadline.getTime())
            ? deadline
            : new Date(),
        eventId: item.dateId,
      };
    });

  const taskEvents = taskData ? transformTaskDataToEvents(taskData) : [];
  const meetingEvents = transformMeetingDataToEvents(meetingData);
  const importantDateEvents =
    transformImportantDateDataToEvents(importantDatesData);

  return { taskEvents, meetingEvents, importantDateEvents };
}
