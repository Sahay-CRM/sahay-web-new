import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "lucide-react";
import { FormLabel } from "@/components/ui/form";

interface Props {
  label: string;
  value: Date | string | null;
  onChange: (date: Date | null) => void;
  error?: { message?: string };
  isMandatory?: boolean;
  timeZone?: string; // Optional timezone prop
  disableDaysFromToday?: number; // Number of days from today to disable (default: 0)
  disablePastDates?: boolean; // Whether to disable past dates (default: true)
}

export default function FormDateTimePicker({
  label,
  value,
  onChange,
  error,
  isMandatory,
  disableDaysFromToday = 0,
  disablePastDates = false,
}: Props) {
  const dateValue = typeof value === "string" ? new Date(value) : value;

  const filterDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    if (disablePastDates && compareDate.getTime() < today.getTime()) {
      return false;
    }

    if (disableDaysFromToday === 0) {
      return true;
    }

    const disableUntilDate = new Date(today);
    disableUntilDate.setDate(today.getDate() + disableDaysFromToday);

    return compareDate.getTime() > disableUntilDate.getTime();
  };

  return (
    <div className="w-full">
      {label && (
        <FormLabel className="mb-5">
          {label}{" "}
          {isMandatory && <span className="text-red-500 text-[20px]">*</span>}
        </FormLabel>
      )}
      <div className="relative w-full min-w-0">
        <DatePicker
          selected={dateValue}
          onChange={onChange}
          showTimeSelect
          dateFormat="dd/MM/yyyy h:mm aa"
          placeholderText="Select date and time"
          className="border px-10 py-2 rounded-md w-full text-sm sm:text-base"
          portalId="root"
          popperClassName="responsive-datepicker-popper"
          filterDate={filterDate}
        />
        <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>
      {error && <span className="text-red-500 text-sm">{error.message}</span>}
      <style>
        {`
          .responsive-datepicker-popper {
            z-index: 50;
            min-width: 0;
            width: auto;
            max-width: 95vw;
          }
          .responsive-datepicker-popper .react-datepicker {
            min-width: 0;
            width: auto;
            max-width: 95vw;
          }
            .react-datepicker-wrapper {
            width: 100%;
            }
          @media (max-width: 640px) {
            .responsive-datepicker-popper .react-datepicker {
              font-size: 14px;
              width: 95vw;
              min-width: 0;
            }
            .responsive-datepicker-popper .react-datepicker__time-container {
              width: 100px;
              min-width: 0;
            }
          }
        `}
      </style>
    </div>
  );
}
