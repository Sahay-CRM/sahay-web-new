import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface YearCalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
}

export const YearCalendar: React.FC<YearCalendarProps> = ({
  selected,
  onSelect,
}) => {
  const [currentDecade, setCurrentDecade] = React.useState(
    Math.floor(
      (selected ? selected.getFullYear() : new Date().getFullYear()) / 10,
    ) * 10,
  );

  const years = Array.from({ length: 12 }, (_, i) => currentDecade + i);

  const goToPrevious = () => {
    setCurrentDecade(currentDecade - 10);
  };

  const goToNext = () => {
    setCurrentDecade(currentDecade + 10);
  };

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={goToPrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium text-lg">
          {currentDecade} - {currentDecade + 11}
        </div>
        <Button variant="outline" size="sm" onClick={goToNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {years.map((year) => {
          const yearDate = new Date(year, 0, 1);
          const isSelected = selected && selected.getFullYear() === year;

          return (
            <Button
              key={year}
              variant={isSelected ? "default" : "ghost"}
              className="h-12 text-sm"
              onClick={() => onSelect(yearDate)}
            >
              {year}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
