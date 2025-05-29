// components/shared/Form/FormDateTimePicker.tsx
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: { message?: string };
}

export default function FormDateTimePicker({
  label,
  value,
  onChange,
  error,
}: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <DatePicker
        selected={value}
        onChange={onChange}
        showTimeSelect
        dateFormat="Pp"
        className="border px-2 py-2 rounded-md w-full"
      />
      {error && <span className="text-red-500 text-sm">{error.message}</span>}
    </div>
  );
}
