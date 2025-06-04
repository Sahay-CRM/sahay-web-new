import React from "react";
import { isSameQuarter } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface QuarterCalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
}

export const QuarterCalendar: React.FC<QuarterCalendarProps> = ({
  selected,
  onSelect,
}) => {
  // Calculate the starting year of financial year from selected or today
  const getFinancialYearStart = (date: Date) =>
    date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;

  const [financialYearStart, setFinancialYearStart] = React.useState(
    getFinancialYearStart(selected || new Date()),
  );

  const quarters = [
    {
      label: "Q1",
      start: new Date(financialYearStart, 3, 1), // April
      months: "Apr - Jun",
    },
    {
      label: "Q2",
      start: new Date(financialYearStart, 6, 1), // July
      months: "Jul - Sep",
    },
    {
      label: "Q3",
      start: new Date(financialYearStart, 9, 1), // October
      months: "Oct - Dec",
    },
    {
      label: "Q4",
      start: new Date(financialYearStart + 1, 0, 1), // January (next year)
      months: "Jan - Mar",
    },
  ];

  const goToPrevious = () => {
    setFinancialYearStart((prev) => prev - 1);
  };

  const goToNext = () => {
    setFinancialYearStart((prev) => prev + 1);
  };

  return (
    <div className="p-3">
      {/* Financial Year Header */}
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={goToPrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium text-lg">
          {financialYearStart}–{financialYearStart + 1}
        </div>
        <Button variant="outline" size="sm" onClick={goToNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Quarters Grid */}
      <div className="grid grid-cols-2 gap-3">
        {quarters.map((quarter) => {
          const isSelected = selected && isSameQuarter(quarter.start, selected);

          return (
            <Button
              key={quarter.label}
              variant={isSelected ? "default" : "ghost"}
              className="h-16 flex flex-col justify-center space-y-1"
              onClick={() => onSelect(quarter.start)}
            >
              <div className="font-medium">{quarter.label}</div>
              <div
                className={`text-xs text-muted-foreground ${
                  isSelected ? "text-white" : ""
                }`}
              >
                {quarter.months}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
