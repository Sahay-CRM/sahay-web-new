import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { WeekCalendar } from "./WeekCalendar";
import { MonthCalendar } from "./MonthCalendar";
import { QuarterCalendar } from "./QuarterCalendar";
import { HalfYearCalendar } from "./HalfYearCalendar";
import { YearCalendar } from "./YearCalendar";
import DatePicker from "react-datepicker";

interface FormDatePickerProps {
  value?: Date | null;
  onSubmit: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  periodType?:
    | "DAILY"
    | "WEEKLY"
    | "MONTHLY"
    | "QUARTERLY"
    | "HALFYEARLY"
    | "YEARLY";
}

export const FormDatePicker: React.FC<FormDatePickerProps> = ({
  value,
  onSubmit,
  placeholder = "Pick a date",
  disabled = false,
  className,
  periodType = "DAILY",
}) => {
  const [tempDate, setTempDate] = React.useState<Date | undefined>(
    value ?? undefined,
  );
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setTempDate(value ?? undefined);
  }, [value]);

  const renderCalendar = () => {
    const commonProps = {
      selected: tempDate,
      onSelect: (date: Date) => setTempDate(date),
    };

    switch (periodType) {
      case "YEARLY":
        return <YearCalendar {...commonProps} />;
      case "HALFYEARLY":
        return <HalfYearCalendar {...commonProps} />;
      case "QUARTERLY":
        return <QuarterCalendar {...commonProps} />;
      case "MONTHLY":
        return <MonthCalendar {...commonProps} />;
      case "WEEKLY":
        return <WeekCalendar {...commonProps} />;
      case "DAILY":
      default:
        return (
          <DatePicker
            selected={tempDate}
            onChange={(date: Date) => setTempDate(date)}
            inline
          />
        );
    }
  };

  const getDisplayFormat = () => {
    switch (periodType) {
      case "YEARLY":
        return "yyyy";
      case "HALFYEARLY":
        return "MMM yyyy";
      case "QUARTERLY":
        return "QQQ yyyy";
      case "MONTHLY":
        return "MMMM yyyy";
      case "WEEKLY":
        return "'Week' w, yyyy";
      case "DAILY":
      default:
        return "PPP";
    }
  };

  const getPlaceholderText = () => {
    switch (periodType) {
      case "YEARLY":
        return "Select a year";
      case "HALFYEARLY":
        return "Select half-year";
      case "QUARTERLY":
        return "Select quarter";
      case "MONTHLY":
        return "Select a month";
      case "WEEKLY":
        return "Select a week";
      case "DAILY":
      default:
        return placeholder;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
          onClick={() => setOpen(true)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(value, getDisplayFormat())
          ) : (
            <span>{getPlaceholderText()}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex flex-col">
          {renderCalendar()}
          <div className="p-2 border-t flex justify-end">
            <Button
              size="sm"
              onClick={() => {
                onSubmit(tempDate);
                setOpen(false);
              }}
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
