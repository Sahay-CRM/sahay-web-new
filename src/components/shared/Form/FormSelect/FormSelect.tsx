import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FormLabel, FormControl } from "@/components/ui/form";

interface Option {
  id?: string | number;
  value?: string | number;
  label?: string | number;
}

interface FormSelectProps {
  id?: string;
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  options: Option[];
  disabled?: boolean;
  error?: { message?: string };
  placeholder?: string;
  className?: string;
}

export default function FormSelect({
  id,
  label,
  value,
  onChange,
  options,
  disabled = false,
  error,
  className,
  placeholder = "Select an option",
}: FormSelectProps) {
  return (
    <div className={className}>
      {label && (
        <FormLabel className="mb-2" htmlFor={id}>
          {label}
        </FormLabel>
      )}

      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <FormControl>
          <SelectTrigger className="w-full mb-1" id={id}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        </FormControl>
        <SelectContent className="w-full">
          {options
            .filter((opt) => opt.value !== undefined && opt.value !== "")
            .map((opt) => (
              <SelectItem key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {error?.message && (
        <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
          {error.message}
        </span>
      )}
    </div>
  );
}
