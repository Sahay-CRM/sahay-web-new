import { useDdCompanyMeeting } from "@/features/api/companyMeeting";
import { useAllCompanyTask } from "@/features/api/companyTask";
import useGetHoliday from "@/features/api/Holiday/useGetHoliday";
import { useGetImportantDates } from "@/features/api/importantDates";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { isColorDark } from "@/features/utils/color.utils";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function useCalendar() {
  const [modalData, setModalData] = useState<ImportantDatesDataProps>(
    {} as ImportantDatesDataProps,
  );
  const permission = useSelector(getUserPermission);
  const [addImportantDate, setAddImportantDateModal] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [taskModalData, setTaskModalData] = useState<TaskGetPaging>(
    {} as TaskGetPaging,
  );
  const [meetingModalData, setMeetingModalData] = useState<MeetingData>(
    {} as MeetingData,
  );

  const { data: importantDatesList } = useGetImportantDates();
  const { data: companyTask } = useAllCompanyTask();
  const { data: meetingData } = useDdCompanyMeeting();
  const { data: holidayData } = useGetHoliday({
    filter: {
      monthFlag: 0,
    },
    enable: true,
  });

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
      const bgColor = item.color || "#2e3195";
      const textColor = isColorDark(bgColor) ? "#ffffff" : "#222222";
      return {
        title: (item.taskName || "Task Name") + " (Task)",
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
        bgColor,
        textColor,
        eventType: "task",
      };
    });

  const transformMeetingDataToEvents = (data: Meeting[]): EventData[] =>
    data.map((item) => {
      // Use meetingDateTime for both start and end, matching local time
      const dateTime = item.meetingDateTime;
      const eventDate = dateTime ? new Date(dateTime) : new Date();
      const bgColor = item.color || "#2e3195";
      const textColor = isColorDark(bgColor) ? "#ffffff" : "#222222";
      return {
        title: (item.meetingName || "Meeting Name") + " (Meeting)",
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
        bgColor,
        textColor,
        eventType: "meeting",
      };
    });

  const transformImportantDateDataToEvents = (data: ImportantDateData[]) =>
    data.map((item) => {
      // Use 'importantDate' field from API, not 'date'
      const deadline = item.importantDate ? new Date(item.importantDate) : null;
      const bgColor = item.color || "#2f328b";
      const textColor = isColorDark(bgColor) ? "#ffffff" : "#222222";
      return {
        title: item.importantDateName || "Important Dates",
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
        bgColor,
        textColor,
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

  const handleTaskModal = (taskId: string) => {
    setIsTaskModalOpen(true);

    const tasksArray = Array.isArray(companyTask?.data)
      ? companyTask.data
      : companyTask?.data
        ? [companyTask.data]
        : [];
    const taskData = tasksArray.find(
      (task: TaskGetPaging) => task.taskId === taskId,
    );

    setTaskModalData(taskData);
  };
  const handleMeetingModal = (meetingId: string) => {
    const meetingsArray = Array.isArray(meetingData)
      ? meetingData
      : meetingData
        ? [meetingData]
        : [];
    const meeting = meetingsArray.find(
      (m: MeetingData) => m.meetingId === meetingId,
    );
    if (meeting) {
      setMeetingModalData(meeting as MeetingData);
      setIsMeetingModalOpen(true);
    } else {
      setMeetingModalData({} as MeetingData);
      setIsMeetingModalOpen(true); // Still open modal for debugging, or set to false if you want to block
    }
  };

  const closeModal = () => {
    setAddImportantDateModal(false);
    setIsTaskModalOpen(false);
    setIsMeetingModalOpen(false);
    setModalData({} as ImportantDatesDataProps);
    setTaskModalData({} as TaskGetPaging);
    setMeetingModalData({} as MeetingData);
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
    isTaskModalOpen,
    handleTaskModal,
    handleMeetingModal,
    isMeetingModalOpen,
    meetingModalData,
    taskModalData,
    closeModal,
    holidayData,
  };
}
