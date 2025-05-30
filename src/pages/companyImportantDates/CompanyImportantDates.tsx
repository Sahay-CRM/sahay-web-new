import { format, parse, startOfWeek, getDay } from "date-fns";

import useCalendar from "./useCompanyImportantDates";

import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { dateFnsLocalizer } from "react-big-calendar";
import { Calendar as BigCalendar } from "react-big-calendar";
import FormSelect from "@/components/shared/Form/FormSelect";
import { FormProvider, useForm } from "react-hook-form";
import CalenderFormModal from "./calenderFormModal/CalenderFormModal";

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
  } = useCalendar();

  const [selectedOption, setSelectedOption] = useState<
    "all" | "task" | "meeting" | "importantDate"
  >("all");

  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(
      event.target.value as "all" | "task" | "meeting" | "importantDate",
    );
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

  return (
    <FormProvider {...methods}>
      <div className="px-4 h-[calc(100vh-140px)] min-h-[500px] overflow-y-auto">
        <div className="mb-4 flex justify-between gap-5">
          <div>
            <Button onClick={() => handleAddModal()}>Add Important Date</Button>
          </div>
          <div>
            <FormSelect
              value={selectedOption}
              onChange={handleOptionChange}
              options={[
                { value: "all", label: "All" },
                { value: "task", label: "Tasks" },
                { value: "meeting", label: "Meeting" },
                { value: "importantDate", label: "ImportantDate" },
              ]}
              containerClass="min-w-[180px]"
              className="h-9"
            />
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
          events={events}
          startAccessor="start"
          endAccessor="end"
          className="rounded-lg p-1 shadow-sm"
          onSelectEvent={(event) => {
            setAddImportantDateModal(true);
            setModalData(event);
          }}
          style={{
            overflowY: "auto",
            height: "88%",
          }}
        />
      </div>
    </FormProvider>
  );
}

export default Calendar;
