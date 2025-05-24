import { format, parse, startOfWeek, getDay } from "date-fns";

import useCalendar from "./useCompanyImportantDates";

import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import FormSelect from "@/components/shared/Form/FormSelect/Select";
import { dateFnsLocalizer } from "react-big-calendar";
import { Calendar as BigCalendar } from "react-big-calendar";

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
  const { taskEvents, meetingEvents, importantDateEvents } = useCalendar();

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
    <div className="px-4 h-[calc(100vh-140px)] min-h-[500px] overflow-y-auto">
      <div className="mb-4 flex justify-between gap-5">
        <div>
          <Button>Add Important Date</Button>
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
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        className="rounded-lg p-1 shadow-sm"
        style={{
          overflowY: "auto",
          height: "88%",
        }}
      />
    </div>
  );
}

export default Calendar;
