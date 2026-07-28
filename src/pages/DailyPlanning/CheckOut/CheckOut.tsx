import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { FormProvider, useForm } from "react-hook-form";
import { dateFnsLocalizer, Calendar as BigCalendar } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { Lock } from "lucide-react";

import { useTimeSlotSelection, EventData } from "@/pages/companyImportantDates/useTimeSlotSelection";
import TimeSlotDrawer from "@/pages/companyImportantDates/TimeSlotDrawer";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { getUserDetail } from "@/features/selectors/auth.selector";

import "react-big-calendar/lib/css/react-big-calendar.css";

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

  return (
    <div className="custom-event-inner h-full w-full">
      <div
        className="custom-event-day-week flex flex-col h-full rounded-sm px-2 py-1 shadow-xs transition-all hover:brightness-95 select-none overflow-hidden border border-white/10"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <div className="text-[11px] font-semibold leading-snug truncate">
          {event.title}
          {startStr && endStr && (
            <span className="font-normal opacity-80 ml-1">
              ({startStr} – {endStr})
            </span>
          )}
        </div>
        {event.description && event.description !== event.title && (
          <div className="text-[9px] opacity-75 truncate mt-0.5">
            {event.description}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckOut() {
  const methods = useForm();
  const { setBreadcrumbs } = useBreadcrumbs();

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

  useEffect(() => {
    setBreadcrumbs([
      { label: "Daily Planning", href: "" },
      { label: "Check-out", href: "" },
    ]);
    // Force Day view for checkout timesheet logging
    setCurrentView("day");
  }, [setBreadcrumbs, setCurrentView]);

  const todayDate = useMemo(() => new Date(), []);

  // Company check-in / check-out times from Redux user detail
  const user = useSelector(getUserDetail);

  const companyTimesMinutes = useMemo(() => {
    const parse = (timeStr?: string | null) => {
      if (!timeStr) return null;
      const [h, m] = timeStr.split(":").map(Number);
      if (isNaN(h) || isNaN(m)) return null;
      return h * 60 + m;
    };
    return {
      checkIn: parse(user?.companyStartTime),
      checkOut: parse(user?.companyEndTime),
    };
  }, [user?.companyStartTime, user?.companyEndTime]);

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
    const list = customEvents;
    if (placeholderEvent) {
      return [...list, placeholderEvent];
    }
    return list;
  }, [customEvents, placeholderEvent]);

  return (
    <FormProvider {...methods}>
      <div className="w-full h-full px-2 sm:px-4 py-4 flex flex-col overflow-hidden">
        <style>{`
          /* Grid View Layout - Google Calendar Day View style */
          .rbc-time-view {
            border: none !important;
            background-color: #ffffff !important;
            font-family: inherit !important;
          }
          /* Hide library's own header - we render our own */
          .rbc-time-header {
            display: none !important;
          }
          .rbc-time-content {
            border-top: 1px solid #dadce0 !important;
            border-bottom: none !important;
            padding-bottom: 52px !important;
          }
          .rbc-time-content > * + * {
            border-left: 1px solid #dadce0 !important;
          }
          .rbc-timeslot-group {
            border-bottom: 1px solid #f1f3f4 !important;
            min-height: 56px !important;
          }
          .rbc-day-slot .rbc-time-slot {
            border-top: none !important;
          }
          /* Gutter must have SAME height as day column groups to keep labels aligned */
          .rbc-time-gutter .rbc-timeslot-group {
            border-bottom: 1px solid transparent !important;
          }
          .rbc-label {
            font-size: 10px !important;
            color: #70757a !important;
            font-weight: 500 !important;
            padding: 0 10px !important;
            text-transform: uppercase !important;
            display: block !important;
            transform: translateY(-50%) !important;
          }
          .rbc-time-gutter .rbc-timeslot-group:first-child .rbc-label {
            transform: none !important;
          }
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
            background-color: rgba(46, 49, 149, 0.2) !important;
            border: 1.5px solid #2e3195 !important;
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
          }
          .custom-event-day-week {
            border-radius: 4px !important;
            border: 1px solid #ffffff !important;
            box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3) !important;
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
          }
          /* Company Start Time marker - light green line */
          .rbc-day-slot .rbc-time-slot.rbc-company-checkin-line {
            position: relative !important;
            overflow: visible !important;
          }
          .rbc-day-slot .rbc-time-slot.rbc-company-checkin-line::after {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 1.5px !important;
            background-color: rgba(34, 197, 94, 0.6) !important;
            z-index: 4 !important;
            pointer-events: none !important;
          }
          .rbc-time-gutter .rbc-time-slot.rbc-company-checkin-line {
            position: relative !important;
          }
          .rbc-time-gutter .rbc-time-slot.rbc-company-checkin-line::after {
            content: 'In' !important;
            position: absolute !important;
            top: -8px !important;
            right: 2px !important;
            font-size: 8px !important;
            font-weight: 700 !important;
            color: #16a34a !important;
            background: #dcfce7 !important;
            border-radius: 3px !important;
            padding: 0 3px !important;
            line-height: 14px !important;
            z-index: 5 !important;
            letter-spacing: 0.3px !important;
          }

          /* Company End Time marker - light orange line */
          .rbc-day-slot .rbc-time-slot.rbc-company-checkout-line {
            position: relative !important;
            overflow: visible !important;
          }
          .rbc-day-slot .rbc-time-slot.rbc-company-checkout-line::after {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 1.5px !important;
            background-color: rgba(249, 115, 22, 0.6) !important;
            z-index: 4 !important;
            pointer-events: none !important;
          }
          .rbc-time-gutter .rbc-time-slot.rbc-company-checkout-line {
            position: relative !important;
          }
          .rbc-time-gutter .rbc-time-slot.rbc-company-checkout-line::after {
            content: 'Out' !important;
            position: absolute !important;
            top: -8px !important;
            right: 2px !important;
            font-size: 8px !important;
            font-weight: 700 !important;
            color: #ea580c !important;
            background: #ffedd5 !important;
            border-radius: 3px !important;
            padding: 0 3px !important;
            line-height: 14px !important;
            z-index: 5 !important;
            letter-spacing: 0.3px !important;
          }
        `}</style>



        {/* Google Calendar Day-view Container */}
        <div className="flex-1 border border-[#dadce0] rounded-lg overflow-hidden flex flex-col bg-white">
          {/* Custom Header Row - replaces library's collapsed header */}
          <div
            className="flex shrink-0 bg-white border-b border-[#dadce0] overflow-hidden"
            style={{ height: "52px" }}
          >
            {/* Gutter area - matches rbc-time-gutter width (~65px) */}
            <div
              className="flex items-center justify-center text-[10px] text-gray-500 font-bold select-none border-r border-[#dadce0] shrink-0"
              style={{ width: "65px" }}
            >
              GMT+05:30
            </div>
            {/* Date column */}
            <div className="flex-1 flex items-center gap-3 px-5">
              <span
                className="flex items-center justify-center w-9 h-9 rounded-full text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: "var(--color-primary, #2e3195)" }}
              >
                {format(todayDate, "d")}
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-[13px] font-semibold text-slate-800">
                  {format(todayDate, "EEEE")}
                </span>
                <span className="text-[11px] text-gray-500">
                  {format(todayDate, "MMMM yyyy")}
                </span>
              </div>
              {/* Hint - flex end */}
              <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-400 font-medium pr-2">
                <Lock className="h-3 w-3" />
                <span>Double click or drag on time slot grid to log time</span>
              </div>
            </div>
          </div>

          <BigCalendar
            localizer={localizer}
            events={mergedEvents}
            startAccessor="start"
            endAccessor="end"
            className="flex-1"
            selectable={isFeatureEnabled && !isDrawerOpen && currentView === "day"}
            onSelectSlot={handleSelectSlot}
            onSelecting={() => true}
            longPressThreshold={250}
            view="day"
            views={["day"]}
            toolbar={false}
            step={15}
            timeslots={4}
            components={{ event: CustomEventComponent }}
            slotPropGetter={(date: Date) => {
              const slotMinutes = date.getHours() * 60 + date.getMinutes();
              const isCheckIn = companyTimesMinutes.checkIn !== null && slotMinutes === companyTimesMinutes.checkIn;
              const isCheckOut = companyTimesMinutes.checkOut !== null && slotMinutes === companyTimesMinutes.checkOut;
              if (isCheckIn) return { className: "rbc-company-checkin-line" };
              if (isCheckOut) return { className: "rbc-company-checkout-line" };
              return {};
            }}
            onSelectEvent={(event: EventData) => {
              handleSelectEvent(event);
            }}
            defaultDate={todayDate}
            date={todayDate}
          />
        </div>

        {/* TimeSlot Selection Drawer */}
        {isDrawerOpen && (
          <TimeSlotDrawer
            isOpen={isDrawerOpen}
            onClose={closeDrawer}
            selectedSlot={selectedSlot}
            editingEvent={editingEvent}
            onSave={saveEvent}
            onDelete={deleteEvent}
          />
        )}
      </div>
    </FormProvider>
  );
}
