// // components/shared/Form/FormDateTimePicker.tsx
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

// interface Props {
//   label: string;
//   value: Date | null;
//   onChange: (date: Date | null) => void;
//   error?: { message?: string };
// }

// export default function FormDateTimePicker({
//   label,
//   value,
//   onChange,
//   error,
// }: Props) {
//   return (
//     <div className="flex flex-col gap-1">
//       <label className="text-sm font-medium">{label}</label>
//       <DatePicker
//         selected={value}
//         onChange={onChange}
//         showTimeSelect
//         dateFormat="Pp"
//         className="border px-2 py-2 rounded-md w-full"
//       />
//       {error && <span className="text-red-500 text-sm">{error.message}</span>}
//     </div>
//   );
// }

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
      <div className="relative w-full">
        <DatePicker
          selected={value}
          onChange={onChange}
          showTimeSelect
          dateFormat="Pp"
          placeholderText="Select date and time"
          className="border px-10 py-2 rounded-md w-full"
        />
        <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>
      {error && <span className="text-red-500 text-sm">{error.message}</span>}
    </div>
  );
}
