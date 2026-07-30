/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { getUserDetail } from "@/features/selectors/auth.selector";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  useAddTimeLog,
  useGetAllTimeLogs,
  useUpdateTimeLog,
  useDeleteTimeLog,
} from "@/features/api/timeLog";
import useGetDailyPlan from "@/features/api/dailyPlan/useGetDailyPlan";

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

export const ALLOW_OVERLAPPING_TIME_LOGS = false;

function isOverlapping(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return start1 < end2 && end1 > start2;
}

export function useTimeSlotSelection() {
  const [isFeatureEnabled, setIsFeatureEnabled] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<string>("month");
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const userDetail = useSelector(getUserDetail);
  const employeeId = userDetail?.employeeId;

  const todayDateStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const { data: dailyPlanData } = useGetDailyPlan(employeeId || "", todayDateStr);

  const items = useMemo(() => {
    if (!dailyPlanData) return [];
    if (Array.isArray(dailyPlanData.data)) {
      return dailyPlanData.data;
    }
    return dailyPlanData.data?.dailyPlanItems || [];
  }, [dailyPlanData]);

  const overtimeHours = useMemo(() => {
    if (!userDetail?.companyStartTime || !userDetail?.companyEndTime) return 0;
    const [startH, startM] = userDetail.companyStartTime.split(":").map(Number);
    const [endH, endM] = userDetail.companyEndTime.split(":").map(Number);
    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;
    let companyWorkingMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (companyWorkingMinutes < 0) companyWorkingMinutes += 24 * 60;

    const totalEstimatedTime = items.reduce((acc: number, curr: any) => acc + (curr.estimatedTime || 0), 0);
    if (totalEstimatedTime > companyWorkingMinutes) {
      return (totalEstimatedTime - companyWorkingMinutes) / 60;
    }
    return 0;
  }, [items, userDetail]);

  const isCheckoutWindowExpired = useMemo(() => {
    if (!userDetail?.companyEndTime) return false;
    const [endHour, endMin] = userDetail.companyEndTime.split(":").map(Number);
    const checkoutStartDateTime = new Date();
    checkoutStartDateTime.setHours(endHour, endMin, 0, 0);

    const checkoutWindowHours = Math.max(2, overtimeHours + 2);
    const cutOffDateTime = new Date(checkoutStartDateTime.getTime() + checkoutWindowHours * 60 * 60 * 1000);

    const now = new Date();
    return now.getTime() > cutOffDateTime.getTime();
  }, [userDetail?.companyEndTime, overtimeHours]);

  const checkoutDeadlineStr = useMemo(() => {
    if (!userDetail?.companyEndTime) return "";
    const [endHour, endMin] = userDetail.companyEndTime.split(":").map(Number);
    const checkoutStartDateTime = new Date();
    checkoutStartDateTime.setHours(endHour, endMin, 0, 0);

    const checkoutWindowHours = Math.max(2, overtimeHours + 2);
    const cutOffDateTime = new Date(checkoutStartDateTime.getTime() + checkoutWindowHours * 60 * 60 * 1000);
    return format(cutOffDateTime, "hh:mm a");
  }, [userDetail?.companyEndTime, overtimeHours]);

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
      const logDate = log.date || 
                      (log.createdDatetime ? log.createdDatetime.split("T")[0] : undefined) || 
                      (log.createdAt ? log.createdAt.split("T")[0] : undefined);
      
      let start: Date;
      let end: Date;

      if (log.startHours && typeof log.startHours === "string" && log.startHours.includes("T")) {
        start = new Date(log.startHours);
      } else {
        const startHoursVal = log.startHours ? parseFloat(String(log.startHours)) : 0;
        start = convertHoursToDate(logDate, startHoursVal);
      }

      if (log.endHours && typeof log.endHours === "string" && log.endHours.includes("T")) {
        end = new Date(log.endHours);
      } else {
        const endHoursVal = log.endHours ? parseFloat(String(log.endHours)) : 0;
        end = convertHoursToDate(logDate, endHoursVal);
      }
      const typeVal = log.type || "TASK";
      const isTask = typeVal === "TASK";
      const isGantt = typeVal === "GANTT";

      // Get actual name from refDetails (API response) or fallback chains
      const actualName = isTask
        ? (log.refDetails?.taskName ||
           log.taskDetails?.taskName ||
           log.note ||
           "Task Log")
        : isGantt
        ? (log.refDetails?.itemName ||
           log.note ||
           "Gant Task Log")
        : (log.refDetails?.meetingName ||
           log.meetingDetails?.meetingName ||
           log.note ||
           "Meeting Log");
      
      return {
        eventId: log.timeLogId,
        title: actualName,
        description: log.note || "",
        start,
        end,
        bgColor: isTask ? "#2e3195" : isGantt ? "#8b5cf6" : "#10b981",
        textColor: "#ffffff",
        eventType: typeVal.toLowerCase(),
        timeLogId: log.timeLogId,
        refId: log.refId,
      } as EventData;
    });
  }, [timeLogs]);

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date; action: string }) => {
      if (!isFeatureEnabled) return;

      // Only allow in Day view
      const isTimeSlotView = currentView === "day";
      if (!isTimeSlotView) return;

      // Validate date limit for new logs
      const logDate = new Date(slotInfo.start);
      logDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const diffTime = today.getTime() - logDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      const limitStr = import.meta.env.VITE_TIMESHEET_PREVIOUS_DAYS_LIMIT;
      const limitDays = limitStr ? parseInt(limitStr, 10) : 1;
      
      if (diffDays > limitDays) {
        toast.error(`You cannot log time for dates older than ${limitDays} day(s) ago.`);
        return;
      }

      // Check check-out window expiration for today's logs
      const isTodaySlot = logDate.getTime() === today.getTime();
      if (isTodaySlot && isCheckoutWindowExpired) {
        toast.error("Checkout window has expired. You cannot log time for today.");
        return;
      }

      // Avoid trigger on clicking single date cell in month view if it leaks
      if (slotInfo.action === "select") {
        if (!ALLOW_OVERLAPPING_TIME_LOGS) {
          const hasOverlap = customEvents.some((event) =>
            isOverlapping(slotInfo.start, slotInfo.end, event.start, event.end)
          );
          if (hasOverlap) {
            return;
          }
        }

        setSelectedSlot({
          start: slotInfo.start,
          end: slotInfo.end,
        });
        setEditingEvent(null);
        setIsDrawerOpen(true);
      }
    },
    [isFeatureEnabled, currentView, isCheckoutWindowExpired, customEvents]
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
      _title: string,
      description: string,
      customStart?: Date,
      customEnd?: Date,
      eventTypeStr?: "task" | "meeting" | "gantt",
      refId?: string
    ) => {
      const finalStart = customStart || selectedSlot?.start;
      const finalEnd = customEnd || selectedSlot?.end;
      if (!finalStart || !finalEnd || !employeeId) return;

      const dateStr = format(finalStart, "yyyy-MM-dd");
      const startHours = finalStart.toISOString();
      const endHours = finalEnd.toISOString();
      const type = (eventTypeStr?.toUpperCase() || "TASK") as "TASK" | "MEETING" | "GANTT";

      // Enforce checkout window constraint for today
      const eventDate = new Date(finalStart);
      eventDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isTodayEvent = eventDate.getTime() === today.getTime();
      if (isTodayEvent && isCheckoutWindowExpired) {
        toast.error("Checkout window has expired. You cannot modify time logs for today.");
        return;
      }

      if (!ALLOW_OVERLAPPING_TIME_LOGS) {
        const hasOverlap = customEvents.some((event) => {
          if (editingEvent && event.eventId === editingEvent.eventId) {
            return false;
          }
          return isOverlapping(finalStart, finalEnd, event.start, event.end);
        });
        if (hasOverlap) {
          toast.error("The selected time range overlaps with an existing time log.");
          return;
        }
      }

      if (editingEvent) {
        // Edit existing time log
        updateTimeLog({
          timeLogId: editingEvent.eventId,
          startHours,
          endHours,
          note: description,
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
          note: description,
          date: dateStr,
        });
      }

      setIsDrawerOpen(false);
      setSelectedSlot(null);
      setEditingEvent(null);
    },
    [selectedSlot, editingEvent, employeeId, addTimeLog, updateTimeLog, isCheckoutWindowExpired, customEvents]
  );

  const deleteEvent = useCallback(() => {
    if (!editingEvent || !editingEvent.timeLogId) return;

    if (editingEvent.start) {
      const eventDate = new Date(editingEvent.start);
      eventDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isTodayEvent = eventDate.getTime() === today.getTime();
      if (isTodayEvent && isCheckoutWindowExpired) {
        toast.error("Checkout window has expired. You cannot delete time logs for today.");
        return;
      }
    }

    deleteTimeLog(editingEvent.timeLogId);
    setIsDrawerOpen(false);
    setSelectedSlot(null);
    setEditingEvent(null);
  }, [editingEvent, deleteTimeLog, isCheckoutWindowExpired]);

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
    isCheckoutWindowExpired,
    checkoutDeadlineStr,
  };
}
