import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { dateFnsLocalizer } from "react-big-calendar";
import { Calendar as BigCalendar } from "react-big-calendar";
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
        <div className="flex justify-between gap-5">
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
          </div>

          {/* RIGHT SIDE SELECT */}
          {(permission.TASK?.View ||
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

        {addImportantDate && (
          <CalenderFormModal
            isModalOpen={addImportantDate}
            modalClose={handleCloseModal}
            modalData={modalData}
          />
        )}
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          className="rounded-lg p-1 shadow-sm"
          onSelectEvent={(event: EventData) => {
            if (
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
          eventPropGetter={(event) => ({
            style: {
              minHeight: 22,
              backgroundColor: event.bgColor,
              color: event.textColor,
              fontSize: "12px",
            },
          })}
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
      </div>
    </FormProvider>
  );
}

export default Calendar;
