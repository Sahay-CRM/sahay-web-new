/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { format, isToday } from "date-fns";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface SingleCalendarDatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  variant?: "outline" | "ghost";
}

export default function SingleCalendarDatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  className,
  variant = "outline",
}: SingleCalendarDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Normalize date helper
  const formatDateLabel = (d: Date | undefined): string => {
    if (!d) return "Pick a date";
    if (isToday(d)) return "Today";
    return format(d, "dd MMM yyyy");
  };

  // Build the disabled days criteria for react-day-picker v10
  const disabledDays = React.useMemo(() => {
    const rules: any[] = [];
    if (minDate) {
      rules.push({ before: minDate });
    }
    if (maxDate) {
      rules.push({ after: maxDate });
    }
    return rules;
  }, [minDate, maxDate]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 h-9 text-sm font-semibold text-slate-700 transition-colors cursor-pointer",
            variant === "outline" && "bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs rounded-lg",
            variant === "ghost" && "hover:bg-slate-50 border-none shadow-none rounded-lg",
            className
          )}
        >
          <CalendarDays className="h-4 w-4 text-primary shrink-0" />
          <span className="select-none">{formatDateLabel(value)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border border-slate-200 rounded-2xl shadow-xl z-50 bg-white" align="center">
        <div className="p-3">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange?.(date);
              setIsOpen(false);
            }}
            defaultMonth={value}
            disabled={disabledDays}
            startMonth={minDate}
            endMonth={maxDate}
            hideNavigation={true}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
