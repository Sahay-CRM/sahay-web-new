import React, { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, AlignLeft, Clock } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useAllCompanyTask } from "@/features/api/companyTask";
import { useDdCompanyMeeting } from "@/features/api/companyMeeting";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import CalendarAddTaskDrawer from "./CalendarAddTaskDrawer";
import MeetingDrawer from "@/pages/companyTask/CompanyTaskFormModal/meetingDrawer";

import { EventData } from "./useTimeSlotSelection";

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
    refId?: string
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
  
  const queryClient = useQueryClient();

  const [eventType, setEventType] = useState<"task" | "meeting">("task");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [selectedMeetingId, setSelectedMeetingId] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [isMeetingDrawerOpen, setIsMeetingDrawerOpen] = useState(false);

  // Queries
  const { data: companyTask } = useAllCompanyTask({
    filter: { search: taskSearch || undefined }
  });
  const { data: meetingData } = useDdCompanyMeeting();

  // Populate options
  const taskOptions = (companyTask?.data || []).map((t) => ({
    label: t.taskName || "Unnamed Task",
    value: t.taskId || "",
  }));

  const meetingOptions = (meetingData || []).map((m) => ({
    label: m.meetingName || "Unnamed Meeting",
    value: m.meetingId || "",
  }));


  
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
      
      const activeSlot = editingEvent || selectedSlot;
      if (activeSlot) {
        setDate(format(activeSlot.start, "yyyy-MM-dd"));
        setStartTime(format(activeSlot.start, "HH:mm"));
        setEndTime(format(activeSlot.end, "HH:mm"));
      }

      if (editingEvent) {
        const type = (editingEvent.eventType as "task" | "meeting") || "task";
        setEventType(type);
        if (type === "task") {
          setSelectedTaskId(editingEvent.refId || "");
          setSelectedMeetingId("");
        } else {
          setSelectedMeetingId(editingEvent.refId || "");
          setSelectedTaskId("");
        }
      } else {
        setEventType("task");
        setSelectedTaskId("");
        setSelectedMeetingId("");
      }
    }
  }, [isOpen, editingEvent, selectedSlot]);

  if (!selectedSlot) return null;

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
    const diffInMinutes = Math.round((parsed.end.getTime() - parsed.start.getTime()) / (1000 * 60));
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
      alert("End time must be after start time");
      return;
    }
    
    const refId = eventType === "task" ? selectedTaskId : selectedMeetingId;
    const selectedTask = companyTask?.data?.find((t) => t.taskId === selectedTaskId);
    const selectedMeet = meetingData?.find((m) => m.meetingId === selectedMeetingId);
    const computedTitle = eventType === "task" 
      ? (selectedTask?.taskName || "Task Log") 
      : (selectedMeet?.meetingName || "Meeting Log");
      
    onSave(computedTitle, description, parsed.start, parsed.end, eventType, refId);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <style>
        {`
          .custom-time-input::-webkit-calendar-picker-indicator {
            display: none !important;
            -webkit-appearance: none !important;
          }
        `}
      </style>
      <SheetContent className="sm:max-w-[420px] p-0 flex flex-col h-full bg-background border-l shadow-2xl">
        <SheetHeader className="p-6 pb-2 border-b flex flex-row items-center justify-between">
          <SheetTitle className="text-lg font-semibold text-foreground">
            {!isEditable ? "View Time Log" : (editingEvent ? "Edit Time Log" : "Create Time Log")}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">

            {/* Log Type Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Log Type
              </Label>
              <div className="flex bg-muted p-1 rounded-lg gap-1">
                {([ "task", "meeting"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      if (isEditable) setEventType(type);
                    }}
                    disabled={!isEditable}
                    className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-all ${
                      !isEditable ? "opacity-60 cursor-not-allowed" : ""
                    } ${
                      eventType === type
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {type === "task" && "Task"}
                    {type === "meeting" && "Meeting"}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Selection Dropdown */}
            {eventType === "task" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Select Task
                  </Label>
                  {isEditable && (
                    <button
                      type="button"
                      onClick={() => setIsTaskDrawerOpen(true)}
                      className="text-xs font-semibold text-primary hover:underline focus:outline-none"
                    >
                      + Add Task
                    </button>
                  )}
                </div>
                <SearchDropdown
                  placeholder="Search and select task..."
                  options={taskOptions}
                  selectedValues={selectedTaskId ? [selectedTaskId] : []}
                  onSelect={(item) => setSelectedTaskId(item.value)}
                  onSearchChange={setTaskSearch}
                  className="w-full text-sm bg-background border rounded-md"
                  isCrossShow={true}
                  disabled={!isEditable}
                />
              </div>
            )}

            {/* Meeting Selection Dropdown */}
            {eventType === "meeting" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Select Meeting
                  </Label>
                  {isEditable && (
                    <button
                      type="button"
                      onClick={() => setIsMeetingDrawerOpen(true)}
                      className="text-xs font-semibold text-primary hover:underline focus:outline-none"
                    >
                      + Add Meeting
                    </button>
                  )}
                </div>
                <SearchDropdown
                  placeholder="Search and select meeting..."
                  options={meetingOptions}
                  selectedValues={selectedMeetingId ? [selectedMeetingId] : []}
                  onSelect={(item) => setSelectedMeetingId(item.value)}
                  onSearchChange={() => {}}
                  className="w-full text-sm bg-background border rounded-md"
                  isCrossShow={true}
                  disabled={!isEditable}
                />
              </div>
            )}

            {/* Date Display (Outside / Above the Card, not changeable) */}
            <div className="flex items-center gap-2 bg-primary/5 text-primary px-3 py-2.5 rounded-lg border border-primary/10 select-none">
              <Calendar className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Date:</span>
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
                  <Label htmlFor="event-start-time" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Start Time
                  </Label>
                  <div 
                    onClick={() => {
                      if (isEditable) {
                        const input = document.getElementById("event-start-time") as HTMLInputElement;
                        if (input && typeof input.showPicker === "function") {
                          try {
                            input.showPicker();
                          } catch (err) {
                            console.error(err);
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
                  <Label htmlFor="event-end-time" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    End Time
                  </Label>
                  <div 
                    onClick={() => {
                      if (isEditable) {
                        const input = document.getElementById("event-end-time") as HTMLInputElement;
                        if (input && typeof input.showPicker === "function") {
                          try {
                            input.showPicker();
                          } catch (err) {
                            console.error(err);
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
                  <span className={`font-semibold rounded-full px-2 py-0.5 ${
                    durationText === "Invalid time range"
                      ? "bg-destructive/10 text-destructive text-[11px]"
                      : "bg-primary/10 text-primary text-[11px]"
                  }`}>
                    {durationText}
                  </span>
                </div>
              )}
            </div>

            {/* Notes Textarea */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlignLeft className="size-4 text-muted-foreground" />
                <Label htmlFor="event-desc" className="text-sm font-semibold text-foreground">
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
 
        {isTaskDrawerOpen && (
          <CalendarAddTaskDrawer
            open={isTaskDrawerOpen}
            onClose={() => setIsTaskDrawerOpen(false)}
            onTaskCreated={(newTask) => {
              setSelectedTaskId(newTask.taskId || "");
              setIsTaskDrawerOpen(false);
            }}
          />
        )}

        {isMeetingDrawerOpen && (
          <MeetingDrawer
            open={isMeetingDrawerOpen}
            onClose={() => setIsMeetingDrawerOpen(false)}
            onMeetingCreated={(newMeeting) => {
              setSelectedMeetingId(newMeeting.meetingId || "");
              setIsMeetingDrawerOpen(false);
              queryClient.invalidateQueries({ queryKey: ["get-meeting-dropdown"] });
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
