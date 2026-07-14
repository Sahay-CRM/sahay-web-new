import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, AlignLeft, Trash2 } from "lucide-react";
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
  const [title, setTitle] = useState("");
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

  // Prefill title & description from selected task
  useEffect(() => {
    if (eventType === "task" && selectedTaskId) {
      const selectedTask = companyTask?.data?.find(t => t.taskId === selectedTaskId);
      if (selectedTask) {
        setTitle(selectedTask.taskName || "");
        setDescription(selectedTask.taskDescription || "");
      }
    }
  }, [selectedTaskId, eventType, companyTask]);

  // Prefill title & description from selected meeting
  useEffect(() => {
    if (eventType === "meeting" && selectedMeetingId) {
      const selectedMeet = meetingData?.find(m => m.meetingId === selectedMeetingId);
      if (selectedMeet) {
        setTitle(selectedMeet.meetingName || "");
        setDescription(selectedMeet.meetingDescription || "");
      }
    }
  }, [selectedMeetingId, eventType, meetingData]);
  
  // Editable time slot states
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle(editingEvent?.title || "");
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
    onSave(title, description, parsed.start, parsed.end, eventType, refId);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-[420px] p-0 flex flex-col h-full bg-background border-l shadow-2xl">
        <SheetHeader className="p-6 pb-2 border-b flex flex-row items-center justify-between">
          <SheetTitle className="text-lg font-semibold text-foreground">
            {editingEvent ? "Edit Custom Event" : "Create Custom Event"}
          </SheetTitle>
          {editingEvent && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors mr-6"
              onClick={onDelete}
              title="Delete Event"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </SheetHeader>

        <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Title Input (Google Calendar Style) */}
            <div className="space-y-2">
              <Label htmlFor="event-title" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Event Title
              </Label>
              <Input
                id="event-title"
                type="text"
                placeholder="Add title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-medium border-0 border-b rounded-none px-0 pb-1.5 focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/50 transition-colors bg-transparent w-full"
                required
                autoFocus
              />
            </div>

            {/* Event Type Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Event Type
              </Label>
              <div className="flex bg-muted p-1 rounded-lg gap-1">
                {([ "task", "meeting"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setEventType(type);
                    }}
                    className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-all ${
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
                  <button
                    type="button"
                    onClick={() => setIsTaskDrawerOpen(true)}
                    className="text-xs font-semibold text-primary hover:underline focus:outline-none"
                  >
                    + Add Task
                  </button>
                </div>
                <SearchDropdown
                  placeholder="Search and select task..."
                  options={taskOptions}
                  selectedValues={selectedTaskId ? [selectedTaskId] : []}
                  onSelect={(item) => setSelectedTaskId(item.value)}
                  onSearchChange={setTaskSearch}
                  className="w-full text-sm bg-background border rounded-md"
                  isCrossShow={true}
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
                  <button
                    type="button"
                    onClick={() => setIsMeetingDrawerOpen(true)}
                    className="text-xs font-semibold text-primary hover:underline focus:outline-none"
                  >
                    + Add Meeting
                  </button>
                </div>
                <SearchDropdown
                  placeholder="Search and select meeting..."
                  options={meetingOptions}
                  selectedValues={selectedMeetingId ? [selectedMeetingId] : []}
                  onSelect={(item) => setSelectedMeetingId(item.value)}
                  onSearchChange={() => {}}
                  className="w-full text-sm bg-background border rounded-md"
                  isCrossShow={true}
                />
              </div>
            )}

            {/* Time / Date Details */}
            <div className="space-y-4 bg-muted/40 p-4 rounded-xl border">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date & Time
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Date Input */}
                <div className="space-y-1">
                  <Label htmlFor="event-date" className="text-[10px] font-semibold text-muted-foreground">
                    Date
                  </Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-8 py-1 px-2 text-xs bg-background rounded-md border"
                    required
                  />
                </div>

                {/* Start Time Input */}
                <div className="space-y-1">
                  <Label htmlFor="event-start-time" className="text-[10px] font-semibold text-muted-foreground">
                    Start Time
                  </Label>
                  <Input
                    id="event-start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-8 py-1 px-2 text-xs bg-background rounded-md border"
                    required
                  />
                </div>

                {/* End Time Input */}
                <div className="space-y-1">
                  <Label htmlFor="event-end-time" className="text-[10px] font-semibold text-muted-foreground">
                    End Time
                  </Label>
                  <Input
                    id="event-end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-8 py-1 px-2 text-xs bg-background rounded-md border"
                    required
                  />
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

            {/* Description Textarea */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlignLeft className="size-4 text-muted-foreground" />
                <Label htmlFor="event-desc" className="text-sm font-semibold text-foreground">
                  Description
                </Label>
              </div>
              <Textarea
                id="event-desc"
                placeholder="Add description or notes"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] resize-none rounded-lg border-input bg-transparent placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary p-3"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t bg-muted/20 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              {editingEvent ? "Save Changes" : "Save Event"}
            </Button>
          </div>
        </form>
 
        {isTaskDrawerOpen && (
          <CalendarAddTaskDrawer
            open={isTaskDrawerOpen}
            onClose={() => setIsTaskDrawerOpen(false)}
            onTaskCreated={(newTask) => {
              setSelectedTaskId(newTask.taskId || "");
              setTitle(newTask.taskName || "");
              setDescription(newTask.taskDescription || "");
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
              setTitle(newMeeting.meetingName || "");
              setIsMeetingDrawerOpen(false);
              queryClient.invalidateQueries({ queryKey: ["get-meeting-dropdown"] });
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
