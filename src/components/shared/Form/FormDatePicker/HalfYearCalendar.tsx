import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HalfYearCalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
}

export const HalfYearCalendar: React.FC<HalfYearCalendarProps> = ({
  selected,
  onSelect,
}) => {
  const getFinancialYearStart = (date: Date) =>
    date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;

  const [financialYearStart, setFinancialYearStart] = React.useState(
    selected
      ? getFinancialYearStart(selected)
      : getFinancialYearStart(new Date()),
  );

  const halfYears = [
    {
      label: "H1",
      start: new Date(financialYearStart, 3, 1), // Apr 1
      months: "Apr - Sep",
      description: "First Half",
    },
    {
      label: "H2",
      start: new Date(financialYearStart + 1, 0, 1), // Jan 1 next year (for selection logic)
      months: "Oct - Mar",
      description: "Second Half",
    },
  ];

  const goToPrevious = () => setFinancialYearStart((prev) => prev - 1);
  const goToNext = () => setFinancialYearStart((prev) => prev + 1);

  const isSelectedHalfYear = (halfYearStart: Date) => {
    if (!selected) return false;
    const selectedTime = selected.getTime();

    const h1End = new Date(financialYearStart, 8, 30).getTime(); // Sep 30
    const h2Start = new Date(financialYearStart, 9, 1).getTime(); // Oct 1
    const h2End = new Date(financialYearStart + 1, 2, 31).getTime(); // Mar 31 next year

    if (halfYearStart.getMonth() === 3) {
      return selectedTime >= halfYearStart.getTime() && selectedTime <= h1End;
    } else {
      return selectedTime >= h2Start && selectedTime <= h2End;
    }
  };

  return (
    // <div className="p-4 w-full max-w-[320px] mx-auto bg-white rounded-lg shadow-md">
    //   {/* Header */}
    //   <div className="flex justify-between items-center mb-6">
    //     <Button variant="outline" size="sm" onClick={goToPrevious}>
    //       <ChevronLeft className="h-5 w-5" />
    //     </Button>
    //     <div className="text-xl font-semibold text-gray-800">
    //       {financialYearStart} – {financialYearStart + 1}
    //     </div>
    //     <Button variant="outline" size="sm" onClick={goToNext}>
    //       <ChevronRight className="h-5 w-5" />
    //     </Button>
    //   </div>

    //   {/* Half-Year Buttons */}
    //   <div className="grid grid-cols-2 gap-6">
    //     {halfYears.map((halfYear) => {
    //       const isSelected = isSelectedHalfYear(halfYear.start);

    //       return (
    //         <button
    //           key={halfYear.label}
    //           onClick={() => onSelect(halfYear.start)}
    //           className={`cursor-pointer rounded-lg p-6 flex flex-col items-center justify-center
    //             border transition-shadow duration-300
    //             ${
    //               isSelected
    //                 ? "bg-primary text-white shadow-lg"
    //                 : "bg-gray-50 text-gray-700 hover:shadow-md hover:bg-primary"
    //             }
    //           `}
    //         >
    //           <div className="text-2xl font-bold mb-1">{halfYear.label}</div>
    //           <div className="text-sm font-medium mb-2">
    //             {halfYear.description}
    //           </div>
    //           <div className="text-xs tracking-wide">{halfYear.months}</div>
    //         </button>
    //       );
    //     })}
    //   </div>
    // </div>
    <div className="p-3">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={goToPrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium text-lg">
          {financialYearStart} – {financialYearStart + 1}
        </div>
        <Button variant="outline" size="sm" onClick={goToNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Quarters Grid */}
      <div className="grid grid-cols-2 gap-3">
        {halfYears.map((halfYear) => {
          const isSelected = isSelectedHalfYear(halfYear.start);

          return (
            <Button
              key={halfYear.label}
              variant={isSelected ? "default" : "ghost"}
              className="h-16 flex flex-col justify-center space-y-1"
              onClick={() => onSelect(halfYear.start)}
            >
              <div className="font-medium">{halfYear.label}</div>
              <div
                className={`text-xs text-muted-foreground ${
                  isSelected ? "text-white" : ""
                }`}
              >
                {halfYear.months}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
