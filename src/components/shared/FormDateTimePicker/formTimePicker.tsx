import { CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { twMerge } from "tailwind-merge";
import { FormLabel } from "@/components/ui/form";

interface FormTimePickerProps {
  label?: string;
  labelClass?: string;
  isMandatory?: boolean;
  value?: string | null; // HH:mm format
  onChange: (value: string) => void;
  error?: { message?: string };
}

export function FormTimePicker({
  label,
  labelClass,
  isMandatory,
  value,
  onChange,
  error,
}: FormTimePickerProps) {
  // Convert "HH:mm" → Date for DatePicker display
  const selectedDate = value
    ? (() => {
        const [hours, minutes] = value.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
      })()
    : null;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <FormLabel className={twMerge("", labelClass)}>
          {label}{" "}
          {isMandatory && <span className="text-red-500 text-[20px]">*</span>}
        </FormLabel>
      )}

      <div className="relative border h-10 flex items-center px-2 rounded-md">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            if (date) {
              const formattedTime = date
                .toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
                .trim();
              onChange(formattedTime);
            } else {
              onChange("");
            }
          }}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={5}
          timeCaption="Time"
          dateFormat="HH:mm"
          timeFormat="HH:mm"
          placeholderText="Select time"
          popperClassName="z-50"
          popperPlacement="bottom-start"
          portalId="root-portal"
        />

        <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
      </div>

      {error?.message && (
        <p className="text-xs text-red-500 mt-1">{error.message}</p>
      )}

      <style>
        {`
          .responsive-datepicker-popper {
            z-index: 9999;
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
            height: 40px;
            }
          .react-datepicker__input-container input {
  width: 100%;
  height: 40px;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
  font-size: 0.875rem;
  color: var(--foreground);
  padding: 0;
}

/* Remove focus ring completely */
.react-datepicker__input-container input:focus {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
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
