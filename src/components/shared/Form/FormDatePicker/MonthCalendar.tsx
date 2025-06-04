import React from "react";
import { format, startOfYear, addMonths, isSameMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthCalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  selected,
  onSelect,
}) => {
  const [currentYear, setCurrentYear] = React.useState(
    selected ? selected.getFullYear() : new Date().getFullYear(),
  );

  const months = Array.from({ length: 12 }, (_, i) => {
    return addMonths(startOfYear(new Date(currentYear, 0, 1)), i);
  });

  const goToPrevious = () => {
    setCurrentYear(currentYear - 1);
  };

  const goToNext = () => {
    setCurrentYear(currentYear + 1);
  };

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={goToPrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium text-lg">{currentYear}</div>
        <Button variant="outline" size="sm" onClick={goToNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {months.map((month) => {
          const isSelected = selected && isSameMonth(month, selected);

          return (
            <Button
              key={month.toISOString()}
              variant={isSelected ? "default" : "ghost"}
              className="h-12 text-sm"
              onClick={() => onSelect(month)}
            >
              {format(month, "MMM")}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
