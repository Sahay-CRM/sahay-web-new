import { format, parse, startOfWeek, getDay } from "date-fns";

import useCalendar from "./useCompanyImportantDates";

import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { dateFnsLocalizer } from "react-big-calendar";
import { Calendar as BigCalendar } from "react-big-calendar";
import FormSelect from "@/components/shared/Form/FormSelect";
import { FormProvider, useForm } from "react-hook-form";
import CalenderFormModal from "./calenderFormModal/CalenderFormModal";
import { useNavigate } from "react-router-dom";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";

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
  } = useCalendar();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Calendar", href: "" }]);
  }, [setBreadcrumbs]);

  const [selectedOption, setSelectedOption] = useState<
    "all" | "task" | "meeting" | "importantDate"
  >("all");

  const navigate = useNavigate();

  // Change handler to accept string value
  const handleOptionChange = (value: string | string[]) => {
    // Only single select, so value is string
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
      label: "ImportantDate",
    });
  if (selectOptions.length > 1)
    selectOptions.unshift({ value: "all", label: "All" });

  return (
    <FormProvider {...methods}>
      <div className="px-4 h-[calc(100vh-140px)] min-h-[500px] overflow-y-auto">
        <div className="mb-4 flex justify-between gap-5">
          {(permission.IMPORTANT_DATE.Add ||
            permission.IMPORTANT_DATE.Edit) && (
            <div>
              <Button onClick={() => handleAddModal()}>
                Add Important Date
              </Button>
            </div>
          )}
          {(permission.TASK?.View ||
            permission.MEETING?.View ||
            permission.IMPORTANT_DATE?.View) && (
            <div>
              <FormSelect
                value={selectedOption}
                onChange={handleOptionChange}
                options={selectOptions}
                className="h-9"
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
                bgColor: event.bgColor,
                textColor: event.textColor,
                eventType: event.eventType,
              });
            } else if (event.eventType === "task" && permission.TASK.Edit) {
              navigate(`/dashboard/tasks/edit/${event.eventId}`);
            } else if (
              event.eventType === "meeting" &&
              permission.MEETING.Edit
            ) {
              navigate(`/dashboard/meeting/edit/${event.eventId}`);
            }
          }}
          eventPropGetter={(event) => ({
            style: {
              minHeight: 28,
              backgroundColor: event.bgColor,
              color: event.textColor,
            },
          })}
        />
      </div>
    </FormProvider>
  );
}

export default Calendar;
