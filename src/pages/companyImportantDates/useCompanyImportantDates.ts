import { useDdCompanyMeeting } from "@/features/api/companyMeeting";
import { useAllCompanyTask } from "@/features/api/companyTask";
import { useGetImportantDates } from "@/features/api/importantDates";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function useCalendar() {
  const [modalData, setModalData] = useState<ImportantDatesDataProps>(
    {} as ImportantDatesDataProps,
  );
  const permission = useSelector(getUserPermission).IMPORTANT_DATE;
  const [addImportantDate, setAddImportantDateModal] = useState(false);

  const { data: importantDatesList } = useGetImportantDates();
  const { data: companyTask } = useAllCompanyTask();
  const { data: meetingData } = useDdCompanyMeeting();

  const transformTaskDataToEvents = (data: TaskGetPaging[]): EventData[] =>
    data.map((item) => {
      // Always use new Date(isoString) so JS converts to local time zone
      const hasStart = !!item.taskStartDate;
      const start = hasStart
        ? new Date(item.taskStartDate!)
        : item.taskDeadline
          ? new Date(item.taskDeadline)
          : new Date();
      const end = item.taskDeadline ? new Date(item.taskDeadline) : start;

      return {
        title: item.taskName || "Task Name",
        description: item.taskDescription || "No description provided",
        start:
          start instanceof Date && !isNaN(start.getTime()) ? start : new Date(),
        end: !hasStart
          ? end instanceof Date && !isNaN(end.getTime())
            ? end
            : new Date()
          : end instanceof Date && !isNaN(end.getTime())
            ? end
            : start,
        eventId: item.taskId || "", // ensure string
        bgColor: item.color || "#2e3195",
        textColor: "#ffffff",
        eventType: "task",
      };
    });

  const transformMeetingDataToEvents = (data: Meeting[]): EventData[] =>
    data.map((item) => {
      // Use meetingDateTime for both start and end, matching local time
      const dateTime = item.meetingDateTime;
      const eventDate = dateTime ? new Date(dateTime) : new Date();

      return {
        title: (item.meetingName || "Meeting Name") + " (meeting)",
        description: item.meetingDescription || "No Topic",
        start:
          eventDate instanceof Date && !isNaN(eventDate.getTime())
            ? eventDate
            : new Date(),
        end:
          eventDate instanceof Date && !isNaN(eventDate.getTime())
            ? eventDate
            : new Date(),
        eventId: item.meetingId || "", // ensure string
        bgColor: item.color || "#2e3195",
        textColor: "#ffffff",
        eventType: "meeting",
      };
    });

  const transformImportantDateDataToEvents = (data: ImportantDateData[]) =>
    data.map((item) => {
      // Use 'importantDate' field from API, not 'date'
      const deadline = item.importantDate ? new Date(item.importantDate) : null;
      return {
        title: item.importantDateName || "Important Date",
        description: item.importantDateRemarks || "No Notes",
        start:
          deadline instanceof Date && !isNaN(deadline.getTime())
            ? deadline
            : new Date(),
        end:
          deadline instanceof Date && !isNaN(deadline.getTime())
            ? deadline
            : new Date(),
        eventId: item.importantDateId || "", // ensure string
        bgColor: "#2f328b",
        textColor: "#ffffff",
        eventType: "importantDate",
      };
    });

  const taskEvents =
    companyTask && companyTask.data
      ? transformTaskDataToEvents(
          Array.isArray(companyTask.data)
            ? companyTask.data
            : [companyTask.data],
        )
      : [];

  const meetingEvents =
    meetingData && Array.isArray(meetingData)
      ? transformMeetingDataToEvents(meetingData)
      : [];
  const importantDateEvents =
    importantDatesList && importantDatesList.data
      ? transformImportantDateDataToEvents(importantDatesList.data)
      : [];

  const handleAddModal = () => {
    setModalData({
      importantDateName: "",
      importantDate: "",
      importantDateRemarks: "",
    });
    setAddImportantDateModal(true);
  };

  const handleCloseModal = () => {
    setAddImportantDateModal(false);
  };

  return {
    taskEvents,
    meetingEvents,
    importantDateEvents,
    handleAddModal,
    handleCloseModal,
    addImportantDate,
    setAddImportantDateModal,
    setModalData,
    modalData,
    permission,
  };
}
