import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FormDatePickerProps {
  value?: Date | null;
  onSubmit: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const FormDatePicker: React.FC<FormDatePickerProps> = ({
  value,
  onSubmit,
  placeholder = "Pick a date",
  disabled = false,
  className,
}) => {
  const [tempDate, setTempDate] = React.useState<Date | undefined>(
    value ?? undefined,
  );

  React.useEffect(() => {
    setTempDate(value ?? undefined);
  }, [value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        <div className="flex flex-col">
          <Calendar
            mode="single"
            selected={tempDate}
            onSelect={(date) => setTempDate(date ?? undefined)}
            initialFocus
          />
          <div className="p-2 border-t flex justify-end">
            <Button
              size="sm"
              onClick={() => onSubmit(tempDate)}
              disabled={!tempDate}
            >
              Submit
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
