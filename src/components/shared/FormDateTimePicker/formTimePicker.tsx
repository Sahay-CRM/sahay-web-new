import { CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FormLabel } from "@/components/ui/form";
import { twMerge } from "tailwind-merge";

interface FormTimePickerProps {
  label?: string;
  labelClass?: string;
  isMandatory?: boolean;
  value?: Date | null;
  onChange: (isoString: string) => void;
  error?: { message?: string };
}

export function FormTimePicker({
  label,
  value,
  onChange,
  error,
  isMandatory,
  labelClass,
}: FormTimePickerProps) {
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
          selected={value}
          onChange={(date) => date && onChange(date.toISOString())}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={5}
          timeCaption="Time"
          dateFormat="h:mm aa"
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
