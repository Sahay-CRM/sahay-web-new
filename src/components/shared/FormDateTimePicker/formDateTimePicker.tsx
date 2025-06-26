import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "lucide-react";
import { FormLabel } from "@/components/ui/form";

interface Props {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: { message?: string };
  isMandatory?: boolean;
}

export default function FormDateTimePicker({
  label,
  value,
  onChange,
  error,
  isMandatory,
}: Props) {
  return (
    <div className="w-full">
      {label && (
        <FormLabel>
          {label}{" "}
          {isMandatory && <span className="text-red-500 text-[20px]">*</span>}
        </FormLabel>
      )}
      <div className="relative w-full min-w-0">
        <DatePicker
          selected={value}
          onChange={onChange}
          showTimeSelect
          dateFormat="Pp"
          placeholderText="Select date and time"
          className="border px-10 py-2 rounded-md w-full text-sm sm:text-base"
          popperClassName="responsive-datepicker-popper"
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
