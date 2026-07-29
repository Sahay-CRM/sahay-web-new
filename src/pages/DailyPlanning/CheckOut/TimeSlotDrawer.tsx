import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, AlignLeft, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import useGetDailyPlanItems, {
  PlanDataItem,
  OtherItem,
} from "@/features/api/dailyPlan/useGetDailyPlanItems";
import { getUserDetail } from "@/features/selectors/auth.selector";
import CalendarAddTaskDrawer from "../CalendarAddTaskDrawer";
import MeetingDrawer from "@/pages/companyTask/CompanyTaskFormModal/meetingDrawer";

import { EventData } from "./useTimeSlotSelection";

interface DropdownOption {
  value: string;
  label: string;
  isHeader?: boolean;
}

interface TimeSlotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: { start: Date; end: Date } | null;
  editingEvent: EventData | null;
  onSave: (
    title: string,
    description: string,
    start: Date,
    end: Date,
    eventType?: "task" | "meeting",
    refId?: string,
  ) => void;
  onDelete: () => void;
}

export default function TimeSlotDrawer({
  isOpen,
  onClose,
  selectedSlot,
  editingEvent,
  onSave,
  onDelete,
}: TimeSlotDrawerProps) {
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  // Type stored as uppercase to match API requirement
  const [eventType, setEventType] = useState<"TASK" | "MEETING" | "">("TASK");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  const [isOpenTaskDrawer, setIsOpenTaskDrawer] = useState(false);
  const [isOpenMeetingDrawer, setIsOpenMeetingDrawer] = useState(false);
  const [extraOptions, setExtraOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (isOpenTaskDrawer || isOpenMeetingDrawer) {
      document.body.style.pointerEvents = "auto";
    }
  }, [isOpenTaskDrawer, isOpenMeetingDrawer]);

  // Fetch items only when type is selected
  const { data: planItems } = useGetDailyPlanItems(
    { type: eventType as "TASK" | "MEETING", search: itemSearch || undefined },
    !!eventType,
  );

  const itemOptions = useMemo(() => {
    if (!planItems) return [];

    let plandataList: PlanDataItem[] = [];
    let otherList: OtherItem[] = [];

    if (planItems && typeof planItems === "object") {
      if (Array.isArray(planItems.plandata)) {
        plandataList = planItems.plandata;
      }
      if (Array.isArray(planItems.other)) {
        otherList = planItems.other;
      }
    }

    const options: DropdownOption[] = [];

    const plandataMapped = plandataList
      .map((item: PlanDataItem) => {
        const id =
          item.task?.taskId ||
          item.meeting?.meetingId ||
          item.taskId ||
          item.meetingId ||
          item.planItemId;
        const suffix = item.isPlanned === false ? (item.type === "TASK" ? " (Extra Task)" : " (Extra Meeting)") : "";
        const name =
          (item.task?.taskName || item.meeting?.meetingName || "Unnamed") + suffix;
        return { label: name, value: id };
      })
      .filter((opt) => opt.value);

    const otherMapped = otherList
      .map((item: OtherItem) => {
        const id = item.taskId || item.meetingId;
        const name = item.taskName || item.meetingName || "Unnamed";
        return { label: name, value: id || "" };
      })
      .filter((opt) => opt.value);

    const typeLabel = eventType === "TASK" ? "Tasks" : "Meetings";

    if (plandataMapped.length > 0) {
      options.push({
        value: `header-planned-${eventType}`,
        label: `Planned ${typeLabel}`,
        isHeader: true,
      });
      options.push(...plandataMapped);
    }

    if (otherMapped.length > 0) {
      options.push({
        value: `header-other-${eventType}`,
        label: `Other ${typeLabel}`,
        isHeader: true,
      });
      options.push(...otherMapped);
    }

    // Append any extra created items
    extraOptions.forEach((extra) => {
      const exists = options.some((opt) => opt.value === extra.value);
      if (!exists) {
        options.push(extra);
      }
    });

    return options;
  }, [planItems, eventType, extraOptions]);

  // Editable time slot states
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const isEditable = useMemo(() => {
    if (!date) return true;

    // Parse log date (YYYY-MM-DD)
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    // Today's date in local time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate difference in days
    const diffTime = today.getTime() - logDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Read env limit
    const limitStr = import.meta.env.VITE_TIMESHEET_PREVIOUS_DAYS_LIMIT;
    const limitDays = limitStr ? parseInt(limitStr, 10) : 1;

    return diffDays <= limitDays;
  }, [date]);

  useEffect(() => {
    if (isOpen) {
      setDescription(editingEvent?.description || "");
      setFormError("");

      const activeSlot = editingEvent || selectedSlot;
      if (activeSlot) {
        setDate(format(activeSlot.start, "yyyy-MM-dd"));
        setStartTime(format(activeSlot.start, "HH:mm"));
        setEndTime(format(activeSlot.end, "HH:mm"));
      }

      if (editingEvent) {
        const type = (editingEvent.eventType || "task").toUpperCase() as
          | "TASK"
          | "MEETING";
        setEventType(type);
        setSelectedItemId(editingEvent.refId || "");
      } else {
        setEventType("TASK");
        setSelectedItemId("");
      }
    }
  }, [isOpen, editingEvent, selectedSlot]);

  // Company Start/End time from Redux user detail
  const user = useSelector(getUserDetail);

  const companyTimeWarning = useMemo(() => {
    if (!startTime || !endTime) return null;
    if (!user?.companyStartTime || !user?.companyEndTime) return null;

    const toMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      if (isNaN(h) || isNaN(m)) return null;
      return h * 60 + m;
    };

    const companyStart = toMinutes(user.companyStartTime);
    const companyEnd = toMinutes(user.companyEndTime);
    const start = toMinutes(startTime);
    const end = toMinutes(endTime);

    if (
      companyStart === null ||
      companyEnd === null ||
      start === null ||
      end === null
    ) {
      return null;
    }

    const startOutside = start < companyStart || start > companyEnd;
    const endOutside = end < companyStart || end > companyEnd;

    if (startOutside && endOutside) {
      return {
        type: "overtime" as const,
        message: "This is overtime of company working hours.",
      };
    }
    if (startOutside) {
      return {
        type: "partial" as const,
        message: "Start time is outside company working hours.",
      };
    }
    if (endOutside) {
      return {
        type: "partial" as const,
        message: "End time is outside company working hours.",
      };
    }
    return null;
  }, [startTime, endTime, user?.companyStartTime, user?.companyEndTime]);

  // Helper to parse inputs back to Date objects
  const getParsedDates = () => {
    if (!date || !startTime || !endTime) return null;
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    return { start, end };
  };

  const parsed = getParsedDates();

  // Dynamic Duration Calculation
  let durationText = "";
  if (parsed) {
    const diffInMinutes = Math.round(
      (parsed.end.getTime() - parsed.start.getTime()) / (1000 * 60),
    );
    if (diffInMinutes > 0) {
      const hours = Math.floor(diffInMinutes / 60);
      const mins = diffInMinutes % 60;
      if (hours > 0) {
        durationText = `${hours} hr${hours > 1 ? "s" : ""} ${mins > 0 ? `${mins} min${mins > 1 ? "s" : ""}` : ""}`;
      } else {
        durationText = `${diffInMinutes} min${diffInMinutes > 1 ? "s" : ""}`;
      }
    } else {
      durationText = "Invalid time range";
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed) return;
    if (parsed.end.getTime() <= parsed.start.getTime()) {
      setFormError("End time must be after start time");
      const endInput = document.getElementById(
        "event-end-time",
      ) as HTMLInputElement | null;
      if (endInput) endInput.focus();
      return;
    }

    const selectedOpt = itemOptions.find((opt) => opt.value === selectedItemId);
    const computedTitle =
      selectedOpt?.label || (eventType === "TASK" ? "Task Log" : "Meeting Log");
    const eventTypeLower = eventType.toLowerCase() as "task" | "meeting";

    onSave(
      computedTitle,
      description,
      parsed.start,
      parsed.end,
      eventTypeLower,
      selectedItemId || undefined,
    );
    setFormError("");
  };

  if (!selectedSlot) return null;

  return (
    <>
      <Sheet
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
        modal={!(isOpenTaskDrawer || isOpenMeetingDrawer)}
      >
      <style>
        {`
          .custom-time-input::-webkit-calendar-picker-indicator {
            display: none !important;
            -webkit-appearance: none !important;
          }
        `}
      </style>
      <SheetContent
        className="sm:max-w-[420px] p-0 flex flex-col h-full bg-background border-l shadow-2xl"
        onPointerDownOutside={(e) => {
          if (isOpenTaskDrawer || isOpenMeetingDrawer) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          if (isOpenTaskDrawer || isOpenMeetingDrawer) {
            e.preventDefault();
          }
        }}
      >
        <SheetHeader className="p-6 pb-2 border-b flex flex-row items-center justify-between">
          <SheetTitle className="text-lg font-semibold text-foreground">
            {!isEditable
              ? "View Time Log"
              : editingEvent
                ? "Edit Time Log"
                : "Create Time Log"}
          </SheetTitle>
        </SheetHeader>

        <form
          onSubmit={handleSave}
          className="flex-1 flex flex-col justify-between overflow-hidden"
        >
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Log Type Selector - Dropdown */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Log Type
              </Label>
              <Select
                value={eventType}
                onValueChange={(val) => {
                  if (isEditable) {
                    setEventType(val as "TASK" | "MEETING");
                    setSelectedItemId("");
                    setItemSearch("");
                  }
                }}
                disabled={!isEditable}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TASK">Task</SelectItem>
                  <SelectItem value="MEETING">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Item Selection Dropdown - enabled only after type is selected */}
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {eventType === "TASK"
                    ? "Select Task"
                    : eventType === "MEETING"
                      ? "Select Meeting"
                      : "Select Item"}
                </Label>
                {isEditable && eventType && (
                  eventType === "TASK" ? (
                    <button
                      type="button"
                      onClick={() => setIsOpenTaskDrawer(true)}
                      className="text-xs font-semibold text-primary hover:underline focus:outline-none"
                    >
                      + Add Task
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsOpenMeetingDrawer(true)}
                      className="text-xs font-semibold text-primary hover:underline focus:outline-none"
                    >
                      + Add Meeting
                    </button>
                  )
                )}
              </div>
              <SearchDropdown
                placeholder={
                  !eventType
                    ? "Select type first..."
                    : `Search and select ${eventType === "TASK" ? "task" : "meeting"}...`
                }
                options={itemOptions}
                selectedValues={selectedItemId ? [selectedItemId] : []}
                onSelect={(item) => setSelectedItemId(item.value)}
                onSearchChange={setItemSearch}
                className="w-full text-sm bg-background border rounded-md"
                isCrossShow={true}
                disabled={!isEditable || !eventType}
                footerText={
                  eventType === "TASK"
                    ? "Not finding your task? Click '+ Add Task' above to create one."
                    : eventType === "MEETING"
                      ? "Not finding your meeting? Click '+ Add Meeting' above to create one."
                      : undefined
                }
              />
            </div>

            {/* Date Display (Outside / Above the Card, not changeable) */}
            <div className="flex items-center gap-2 bg-primary/5 text-primary px-3 py-2.5 rounded-lg border border-primary/10 select-none">
              <Calendar className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Date:
              </span>
              <span className="text-sm font-bold">
                {date ? date.split("-").reverse().join("-") : ""}
              </span>
            </div>

            {/* Time Details Card */}
            <div className="space-y-4 bg-muted/40 p-4 rounded-xl border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Logged Time range
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Start Time Input */}
                <div className="space-y-1">
                  <Label
                    htmlFor="event-start-time"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Start Time
                  </Label>
                  <div
                    onClick={() => {
                      if (isEditable) {
                        const input = document.getElementById(
                          "event-start-time",
                        ) as HTMLInputElement;
                        if (input && typeof input.showPicker === "function") {
                          try {
                            input.showPicker();
                          } catch {
                            // Handle error silently
                          }
                        }
                      }
                    }}
                    className="relative cursor-pointer w-full"
                  >
                    <Input
                      id="event-start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="h-9 py-2 pl-3 pr-10 text-sm bg-background rounded-md border w-full focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary cursor-pointer custom-time-input"
                      disabled={!isEditable}
                      required
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none text-muted-foreground" />
                  </div>
                </div>

                {/* End Time Input */}
                <div className="space-y-1">
                  <Label
                    htmlFor="event-end-time"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    End Time
                  </Label>
                  <div
                    onClick={() => {
                      if (isEditable) {
                        const input = document.getElementById(
                          "event-end-time",
                        ) as HTMLInputElement;
                        if (input && typeof input.showPicker === "function") {
                          try {
                            input.showPicker();
                          } catch {
                            //
                          }
                        }
                      }
                    }}
                    className="relative cursor-pointer w-full"
                  >
                    <Input
                      id="event-end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="h-9 py-2 pl-3 pr-10 text-sm bg-background rounded-md border w-full focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary cursor-pointer custom-time-input"
                      disabled={!isEditable}
                      required
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Dynamic Duration Display */}
              {durationText && (
                <div className="flex items-center justify-between pt-2 border-t text-xs">
                  <span className="text-muted-foreground">Duration:</span>
                  <span
                    className={`font-semibold rounded-full px-2 py-0.5 ${
                      durationText === "Invalid time range"
                        ? "bg-destructive/10 text-destructive text-[11px]"
                        : "bg-primary/10 text-primary text-[11px]"
                    }`}
                  >
                    {durationText}
                  </span>
                </div>
              )}

              {/* Company Working Hours Warning */}
              {companyTimeWarning && (
                <div
                  className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
                    companyTimeWarning.type === "overtime"
                      ? "bg-red-100 text-red-700 border-2 border-red-300"
                      : "bg-amber-100 text-amber-700 border border-amber-200 font-medium"
                  }`}
                >
                  <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
                  <span>{companyTimeWarning.message}</span>
                </div>
              )}
            </div>

            {/* Notes Textarea */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlignLeft className="size-4 text-muted-foreground" />
                <Label
                  htmlFor="event-desc"
                  className="text-sm font-semibold text-foreground"
                >
                  Notes
                </Label>
              </div>
              <Textarea
                id="event-desc"
                placeholder={isEditable ? "Add notes..." : "No notes."}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] resize-none rounded-lg border-input bg-transparent placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary p-3"
                disabled={!isEditable}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t bg-muted/20 flex items-center justify-between">
            <div>
              {formError && (
                <div className="text-sm text-destructive font-medium">
                  {formError}
                </div>
              )}
              {editingEvent && isEditable && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  className="px-4 py-2 text-sm font-medium bg-destructive hover:bg-destructive/90 text-destructive-foreground text-white shadow-sm"
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                {isEditable ? "Cancel" : "Close"}
              </Button>
              {isEditable && (
                <Button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                >
                  {editingEvent ? "Save Changes" : "Save"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>

      <CalendarAddTaskDrawer
        open={isOpenTaskDrawer}
        onClose={() => setIsOpenTaskDrawer(false)}
        isPlanningMode={false}
        hideProjectMeetingAdd={true}
        onTaskCreated={(task) => {
          setExtraOptions((prev) => [
            ...prev,
            { value: task.taskId, label: task.taskName },
          ]);
          setSelectedItemId(task.taskId);
          setEventType("TASK");
          setIsOpenTaskDrawer(false);
        }}
      />
      <MeetingDrawer
        open={isOpenMeetingDrawer}
        onClose={() => setIsOpenMeetingDrawer(false)}
        onMeetingCreated={(meet) => {
          setExtraOptions((prev) => [
            ...prev,
            { value: meet.meetingId || "", label: meet.meetingName || "" },
          ]);
          setSelectedItemId(meet.meetingId || "");
          setEventType("MEETING");
          setIsOpenMeetingDrawer(false);
        }}
      />
    </>
  );
}
