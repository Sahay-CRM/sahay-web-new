import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";

interface DateRangePickerProps {
  className?: string;
  onChange?: (range: DateRange | undefined) => void;
  onApply?: (range: DateRange | undefined) => void;
  value?: { from: Date | undefined; to: Date | undefined }; // <-- add this line
}

export default function DateRangePicker({
  className,
  onChange,
  onApply,
  value, // <-- add this line
}: DateRangePickerProps) {
  // Use controlled value if provided, otherwise use local state
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
  });
  const [tempDate, setTempDate] = React.useState<DateRange | undefined>({
    from: new Date(),
  });
  const [isOpen, setIsOpen] = React.useState(false);

  // Sync local state with controlled value
  React.useEffect(() => {
    if (value) {
      setDate(value);
      setTempDate(value);
    }
  }, [value]);

  const handleSelect = (range: DateRange | undefined) => {
    setTempDate(range);
    onChange?.(range); // notify parent for preview purposes
  };

  const handleApply = () => {
    setDate(tempDate);
    onApply?.(tempDate); // trigger API call
    setIsOpen(false);
  };

  return (
    <div className={cn("grid gap-2 bg-white", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-auto min-w-0 px-4 justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : format(date.from, "yyyy-MM-dd") ===
                format(new Date(), "yyyy-MM-dd") ? (
                <>Today - {format(date.from, "dd MMMM yyyy")}</>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto z-50 bg-white mr-8 shadow-2xl p-3 rounded-2xl border mt-2"
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={tempDate?.from}
            selected={tempDate}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
          <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleApply} disabled={!tempDate?.from}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
