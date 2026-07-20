import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { dateFnsLocalizer } from "react-big-calendar";
import { Calendar as BigCalendar, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";

import useCalendar from "./useCompanyImportantDates";

import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "@/components/ui/button";
import FormSelect from "@/components/shared/Form/FormSelect";
import CalenderFormModal from "./calenderFormModal/CalenderFormModal";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import ConfirmationTaskModal from "./confirmationTaskModal";
import ConfirmationMeetingModal from "./confirmationMeetingModal";
import { useNavigate } from "react-router-dom";
import { CalendarClock } from "lucide-react";

import { useTimeSlotSelection } from "./useTimeSlotSelection";
import TimeSlotDrawer from "./TimeSlotDrawer";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function CustomEventComponent({ event }: { event: EventData }) {
  const bgColor = event.bgColor || "#2f328b";
  const textColor = event.textColor || "#ffffff";

  const startStr = event.start ? format(new Date(event.start), "h:mm a") : "";
  const endStr = event.end ? format(new Date(event.end), "h:mm a") : "";
  const timeRange = startStr && endStr ? `${startStr} - ${endStr}` : "";

  return (
    <div className="custom-event-inner h-full w-full">
      {/* Day/Week view layout */}
      <div
        className="custom-event-day-week flex-col h-full rounded-sm p-1 shadow-xs transition-all hover:brightness-95 select-none overflow-hidden border border-white/10"
        style={{
          backgroundColor: bgColor,
          color: textColor,
        }}
      >
        {timeRange && (
          <div className="text-[9px] opacity-90 font-semibold mb-0.5">
            {timeRange}
          </div>
        )}
        <div className="font-bold text-[11px] leading-tight truncate">
          {event.title}
        </div>
        {event.description && (
          <div className="text-[10px] opacity-85 truncate mt-0.5">
            {event.description}
          </div>
        )}
      </div>

      {/* Month view layout */}
      <div
        className="custom-event-month truncate text-[12px] px-1 font-medium"
        style={{
          color: textColor,
        }}
      >
        {event.title}
      </div>
    </div>
  );
}

function Calendar() {
  const methods = useForm();
  const {
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
  } = useCalendar();

  const {
    isFeatureEnabled,
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
  } = useTimeSlotSelection();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Calendar", href: "" }]);
  }, [setBreadcrumbs]);
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<
    "all" | "task" | "meeting" | "importantDate"
  >("all");

  const handleOptionChange = (value: string | string[]) => {
    setSelectedOption(value as "all" | "task" | "meeting" | "importantDate");
  };

  const events = useMemo(() => {
    switch (selectedOption) {
      case "task":
        return taskEvents;
      case "meeting":
        return meetingEvents;
      case "importantDate":
        return importantDateEvents;
      default:
        return [...taskEvents, ...meetingEvents, ...importantDateEvents];
    }
  }, [selectedOption, taskEvents, meetingEvents, importantDateEvents]);

  const placeholderEvent = useMemo(() => {
    if (selectedSlot && isDrawerOpen && !editingEvent) {
      return {
        eventId: "placeholder",
        title: "(Logging Time...)",
        description: "",
        start: selectedSlot.start,
        end: selectedSlot.end,
        bgColor: "#2e3195",
        textColor: "#ffffff",
        eventType: "placeholder",
      } as EventData;
    }
    return null;
  }, [selectedSlot, isDrawerOpen, editingEvent]);

  const mergedEvents = useMemo(() => {
    let list = events;
    if (isFeatureEnabled) {
      if (currentView === "day") {
        // Show ONLY the logged times (customEvents) in Day view
        if (selectedOption === "task") {
          list = customEvents.filter((e) => e.eventType === "task");
        } else if (selectedOption === "meeting") {
          list = customEvents.filter((e) => e.eventType === "meeting");
        } else if (selectedOption === "importantDate") {
          list = [];
        } else {
          list = customEvents;
        }
      } else {
        // Show ONLY the normal calendar events in Month, Week views
        list = events;
      }
    }
    if (placeholderEvent) {
      return [...list, placeholderEvent];
    }
    return list;
  }, [isFeatureEnabled, currentView, events, customEvents, selectedOption, placeholderEvent]);

  // Dynamically build options based on view permissions
  const selectOptions = [];
  if (permission.TASK?.View)
    selectOptions.push({ value: "task", label: "Tasks" });
  if (permission.MEETING_LIST?.View)
    selectOptions.push({ value: "meeting", label: "Meeting" });
  if (permission.IMPORTANT_DATE?.View)
    selectOptions.push({
      value: "importantDate",
      label: "Important Date",
    });
  if (selectOptions.length > 1)
    selectOptions.unshift({ value: "all", label: "All" });

  return (
    <FormProvider {...methods}>
      <div className="px-2 h-[calc(100vh-120px)] min-h-[500px] sm:px-4 py-4">
        <style>{`
          .rbc-day-slot .rbc-event {
            pointer-events: none !important;
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .rbc-day-slot .rbc-event-label {
            display: none !important;
          }
          .rbc-day-slot .rbc-event .custom-event-inner {
            pointer-events: auto !important;
            width: calc(100% - 12px) !important;
            height: 100%;
          }
          .rbc-day-slot .rbc-slot-selection {
            width: calc(100% - 12px) !important;
            background-color: rgba(46, 49, 149, 0.25) !important;
            border: 1.5px solid #2e3195 !important;
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
          }
          .custom-event-day-week {
            display: none;
          }
          .custom-event-month {
            display: block;
          }
          .rbc-day-slot .custom-event-day-week {
            display: flex !important;
          }
          .rbc-day-slot .custom-event-month {
            display: none !important;
          }
        `}</style>
        <div className="flex justify-between gap-5 items-center">
          {/* LEFT SIDE BUTTONS */}
          <div className="flex gap-3">
            {permission.IMPORTANT_DATE.Add && (
              <Button onClick={() => handleAddModal()}>
                Add Important Date
              </Button>
            )}
            {permission.IMPORTANT_DATE.View && (
              <Button onClick={() => navigate("/dashboard/importantdate")}>
                View Important Date
              </Button>
            )}
            <Button onClick={() => navigate("/dashboard/daily-planning")} className="flex items-center gap-2">
              <CalendarClock className="size-4" />
              Daily Planning
            </Button>
          </div>

          {/* RIGHT SIDE SELECT AND TOGGLE */}
          <div className="flex items-center gap-4">
            {currentView !== "day" &&
              (permission.TASK?.View ||
                permission.MEETING_LIST?.View ||
                permission.IMPORTANT_DATE?.View) && (
                <div>
                  <FormSelect
                    value={selectedOption}
                    onChange={(item) =>
                      handleOptionChange(item as string | string[])
                    }
                    options={selectOptions}
                    triggerClassName="mb-0 py-4"
                  />
                </div>
              )}
          </div>
        </div>

        {addImportantDate && (
          <CalenderFormModal
            isModalOpen={addImportantDate}
            modalClose={handleCloseModal}
            modalData={modalData}
          />
        )}
        <BigCalendar
          localizer={localizer}
          events={mergedEvents}
          startAccessor="start"
          endAccessor="end"
          className="rounded-lg p-1 shadow-sm"
          selectable={isFeatureEnabled && !isDrawerOpen && currentView === "day"}
          onSelectSlot={handleSelectSlot}
          onSelecting={() => true}
          longPressThreshold={250}
          view={currentView as View}
          onView={(v) => setCurrentView(v)}
          components={{
            event: CustomEventComponent,
          }}
          onSelectEvent={(event: EventData) => {
            if (event.timeLogId) {
              handleSelectEvent(event);
            } else if (event.eventType === "custom") {
              handleSelectEvent(event);
            } else if (
              event.eventType === "importantDate" &&
              permission.IMPORTANT_DATE &&
              permission.IMPORTANT_DATE.Edit
            ) {
              setAddImportantDateModal(true);
              setModalData({
                importantDateName: event.importantDateName || event.title || "",
                importantDate:
                  event.importantDate ||
                  (event.start &&
                  typeof event.start === "object" &&
                  event.start.toISOString
                    ? event.start.toISOString()
                    : ""),
                importantDateRemarks:
                  event.importantDateRemarks || event.description || "",
                importantDateId: event.importantDateId || event.eventId,
                color: event.bgColor,
                textColor: event.textColor,
                eventType: event.eventType,
              });
            } else if (
              event.eventType === "task" &&
              permission.TASK &&
              permission.TASK.Edit
            ) {
              handleTaskModal(event.eventId);
            } else if (
              event.eventType === "meeting" &&
              permission.MEETING_LIST.Edit
            ) {
              handleMeetingModal(event.eventId);
            }
          }}
          eventPropGetter={(event) => {
            const isPlaceholder = event.eventId === "placeholder";
            return {
              style: {
                minHeight: 22,
                backgroundColor: event.bgColor,
                color: event.textColor,
                fontSize: "12px",
                opacity: isPlaceholder ? 0.65 : 1,
                border: isPlaceholder ? "2px dashed #1a73e8" : "none",
              },
            };
          }}
          dayPropGetter={(date) => {
            // Normalize both dates to start of day in local timezone for comparison
            const currentDate = new Date(date);
            currentDate.setHours(0, 0, 0, 0);

            const holiday = (holidayData || []).find((h) => {
              if (!h.holidayDate) return false;

              // Convert holidayDate to local timezone and set to start of day
              const holidayDate = new Date(h.holidayDate);
              const localHolidayDate = new Date(
                holidayDate.getTime() + holidayDate.getTimezoneOffset() * 60000,
              );
              localHolidayDate.setHours(0, 0, 0, 0);

              return currentDate.getTime() === localHolidayDate.getTime();
            });

            if (holiday) {
              return {
                style: {
                  backgroundColor: "#dfdfdf",
                  border: "2px solid #FF9800",
                  cursor: "pointer",
                },
                "data-tooltip-id": "holiday-tooltip",
                "data-tooltip-content": holiday.holidayName,
              };
            }

            return {};
          }}
        />
      </div>

      <div>
        {isTaskModalOpen && (
          <ConfirmationTaskModal
            isModalOpen={isTaskModalOpen}
            modalClose={closeModal}
            modalData={taskModalData}
          />
        )}
        {isMeetingModalOpen && (
          <ConfirmationMeetingModal
            isModalOpen={isMeetingModalOpen}
            modalClose={closeModal}
            modalData={meetingModalData}
          />
        )}
        <TimeSlotDrawer
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
          selectedSlot={selectedSlot}
          editingEvent={editingEvent}
          onSave={saveEvent}
          onDelete={deleteEvent}
        />
      </div>
    </FormProvider>
  );
}

export default Calendar;
