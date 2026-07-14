import { useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { getUserDetail } from "@/features/selectors/auth.selector";
import { format } from "date-fns";
import {
  useAddTimeLog,
  useGetAllTimeLogs,
  useUpdateTimeLog,
  useDeleteTimeLog,
} from "@/features/api/timeLog";

export interface EventData {
  eventId: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  bgColor?: string;
  textColor?: string;
  eventType?: string;
  importantDateRemarks?: string;
  timeLogId?: string;
  refId?: string;
}

export interface SelectedSlot {
  start: Date;
  end: Date;
}

// Utility to convert Date to decimal hours
export function convertDateToDecimalHours(d: Date): number {
  return d.getHours() + d.getMinutes() / 60;
}

// Utility to convert decimal hours + date string to Date object
export function convertHoursToDate(dateStr?: string, decimalHours?: number): Date {
  const finalHours = decimalHours ?? 0;
  const today = new Date();
  
  if (!dateStr) {
    const hour = Math.floor(finalHours);
    const min = Math.round((finalHours - hour) * 60);
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, min, 0, 0);
  }

  const datePart = dateStr.split("T")[0];
  const parts = datePart.split("-");
  if (parts.length < 3) {
    const hour = Math.floor(finalHours);
    const min = Math.round((finalHours - hour) * 60);
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, min, 0, 0);
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const hour = Math.floor(finalHours);
  const min = Math.round((finalHours - hour) * 60);
  
  return new Date(year, month, day, hour, min, 0, 0);
}

export function useTimeSlotSelection() {
  const [isFeatureEnabled, setIsFeatureEnabled] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<string>("month");
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const userDetail = useSelector(getUserDetail);
  const employeeId = userDetail?.employeeId;

  // Load time log events from API
  const { data: timeLogs } = useGetAllTimeLogs(
    { employeeId: employeeId || "" },
    isFeatureEnabled && !!employeeId
  );

  const { mutate: addTimeLog } = useAddTimeLog();
  const { mutate: updateTimeLog } = useUpdateTimeLog();
  const { mutate: deleteTimeLog } = useDeleteTimeLog();

  const customEvents = useMemo(() => {
    if (!timeLogs) return [];
    return timeLogs.map((log) => {
      const logDate = log.date || (log.createdAt ? log.createdAt.split("T")[0] : undefined);
      const start = convertHoursToDate(logDate, log.startHours);
      const end = convertHoursToDate(logDate, log.endHours);
      const typeVal = log.type || "TASK";
      const isTask = typeVal === "TASK";
      
      return {
        eventId: log.timeLogId,
        title: log.note || (isTask ? "Task Log" : "Meeting Log"),
        description: log.note || "",
        start,
        end,
        bgColor: isTask ? "#2e3195" : "#10b981", // Task is dark blue, Meeting is green
        textColor: "#ffffff",
        eventType: typeVal.toLowerCase(), // "task" or "meeting"
        timeLogId: log.timeLogId,
        refId: log.refId,
      } as EventData;
    });
  }, [timeLogs]);

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date; action: string }) => {
      if (!isFeatureEnabled) return;

      // Only allow in Day/Week views
      const isTimeSlotView = currentView === "week" || currentView === "day";
      if (!isTimeSlotView) return;

      // Avoid trigger on clicking single date cell in month view if it leaks
      if (slotInfo.action === "select") {
        setSelectedSlot({
          start: slotInfo.start,
          end: slotInfo.end,
        });
        setEditingEvent(null);
        setIsDrawerOpen(true);
      }
    },
    [isFeatureEnabled, currentView]
  );

  const handleSelectEvent = useCallback((event: EventData) => {
    if (event.timeLogId) {
      setEditingEvent(event);
      setSelectedSlot({
        start: event.start,
        end: event.end,
      });
      setIsDrawerOpen(true);
      return true; // indicates event was handled
    }
    return false;
  }, []);

  const saveEvent = useCallback(
    (
      title: string,
      description: string,
      customStart?: Date,
      customEnd?: Date,
      eventTypeStr?: "task" | "meeting",
      refId?: string
    ) => {
      const finalStart = customStart || selectedSlot?.start;
      const finalEnd = customEnd || selectedSlot?.end;
      if (!finalStart || !finalEnd || !employeeId) return;

      const dateStr = format(finalStart, "yyyy-MM-dd");
      const startHours = convertDateToDecimalHours(finalStart);
      const endHours = convertDateToDecimalHours(finalEnd);
      const type = (eventTypeStr?.toUpperCase() || "TASK") as "TASK" | "MEETING";

      if (editingEvent) {
        // Edit existing time log
        updateTimeLog({
          timeLogId: editingEvent.eventId,
          startHours,
          endHours,
          note: description || title,
          date: dateStr,
          type,
          refId: refId || undefined,
        });
      } else {
        // Create new time log
        addTimeLog({
          employeeId,
          type,
          refId: refId || undefined,
          startHours,
          endHours,
          note: description || title,
          date: dateStr,
        });
      }

      setIsDrawerOpen(false);
      setSelectedSlot(null);
      setEditingEvent(null);
    },
    [selectedSlot, editingEvent, employeeId, addTimeLog, updateTimeLog]
  );

  const deleteEvent = useCallback(() => {
    if (!editingEvent || !editingEvent.timeLogId) return;

    deleteTimeLog(editingEvent.timeLogId);
    setIsDrawerOpen(false);
    setSelectedSlot(null);
    setEditingEvent(null);
  }, [editingEvent, deleteTimeLog]);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedSlot(null);
    setEditingEvent(null);
  }, []);

  return {
    isFeatureEnabled,
    setIsFeatureEnabled,
    currentView,
    setCurrentView,
    selectedSlot,
    editingEvent,
    isDrawerOpen,
    customEvents,
    handleSelectSlot,
    handleSelectEvent,
    saveEvent,
    deleteEvent,
    closeDrawer,
  };
}
