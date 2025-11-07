import ModalData from "@/components/shared/Modal/ModalData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Switch } from "@/components/ui/switch";
import { useCustomModalFile } from "./useCustomefileRepeatMeeting";
import FormSelect from "@/components/shared/Form/FormSelect";
import { useEffect } from "react";
import DaySelector from "../FormDateTimePicker/DaySelector";
import DateSelector from "../FormDateTimePicker/DateSelector";
import WeeklyPatternSelector from "../FormDateTimePicker/WeeklyPatternSelector";
import { Input } from "@/components/ui/input";

type FrequencyType =
  | "WEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "HALFYEARLY"
  | "YEARLY";
type DateOrWeeklyType = "date" | "WEEKLY" | "MONTHLYEND";

export default function CustomModalFile({
  open,
  onOpenChange,
  onSave,
  defaultValues,
  multiSelectAllow = true,
}: CustomModalFilePropsREPT) {
  const {
    frequencies,
    weeks,
    baseFrequency,
    dateOrWeekly,
    selectedDate,
    selectedMonth,
    selectedWeek,
    selectedDay,
    weeklyPatterns,
    multiSelect,
    setFrequency,
    setDateOrWeekly,
    setSelectedDate,
    setSelectedMonth,
    setSelectedWeek,
    setSelectedDay,
    // setMultiSelect,
    setWeeklyPatterns,
    getScheduleSummary,
    IntervalCount,
    setIntervalCount,
    setIsMonthlyEnd,
    reorderedMonths,
    totalDays,
    convertDaysToAPI,
    convertMonthToAPI,
    isMonthlyEnd,
  } = useCustomModalFile(defaultValues);
  const daysarr: { key: number; label: string; api: string }[] = [
    { key: 0, label: "Su", api: "SUN" },
    { key: 1, label: "Mo", api: "MON" },
    { key: 2, label: "Tu", api: "TUE" },
    { key: 3, label: "We", api: "WED" },
    { key: 4, label: "Th", api: "THU" },
    { key: 5, label: "Fr", api: "FRI" },
    { key: 6, label: "Sa", api: "SAT" },
  ];

  useEffect(() => {
    if (!multiSelect && selectedMonth.length > 1) {
      setSelectedMonth([selectedMonth[0]]);
    }
  }, [multiSelect, selectedMonth, setSelectedMonth]);

  const renderFrequencyFields = () => {
    switch (baseFrequency) {
      case "WEEKLY": {
        return (
          <div className="  w-1/2  space-y-4">
            <div className="flex justify-between mr-10 space-x-2">
              <Label className="mb-2">Select Day</Label>
            </div>

            <div>
              <DaySelector
                value={selectedDay}
                onChange={setSelectedDay}
                multiSelectAllow={multiSelect}
                // alternateDay
                // maxLength={5}
              />
            </div>
          </div>
        );
      }

      case "MONTHLY":
        return (
          <div className="">
            <div className="mb-2">
              <RadioGroup
                value={dateOrWeekly}
                onValueChange={(value: DateOrWeeklyType) => {
                  setDateOrWeekly(value);

                  if (value === "MONTHLYEND") {
                    setIsMonthlyEnd(true);
                    setSelectedWeek(null);
                    setWeeklyPatterns([{ week: null, daysOfWeek: [] }]);
                    setSelectedDay([]);
                    setSelectedDate(null);
                    return;
                  } else {
                    setIsMonthlyEnd(false);
                  }
                  if (value === "date") {
                    setSelectedWeek(null);
                    setWeeklyPatterns([{ week: null, daysOfWeek: [] }]);
                    setSelectedDay([]);
                    setIsMonthlyEnd(false);
                  } else if (value === "WEEKLY") {
                    setSelectedDate(null);
                    setIsMonthlyEnd(false);
                  }
                }}
                className="mt-2 flex"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="date" id="MONTHLY-date" />
                  <Label htmlFor="MONTHLY-date">Specific Date</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="WEEKLY" id="MONTHLY-WEEKLY" />
                  <Label htmlFor="MONTHLY-WEEKLY">Weekly Pattern</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MONTHLYEND" id="MONTHLY-END" />
                  <Label htmlFor="MONTHLY-WEEKLY">Monthly End Date </Label>
                </div>
              </RadioGroup>
            </div>

            <DateSelector
              condition={dateOrWeekly === "date"}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              multiSelect={multiSelect}
            />

            {dateOrWeekly === "WEEKLY" && (
              <WeeklyPatternSelector
                multiSelect={multiSelect}
                weeklyPatterns={weeklyPatterns}
                setWeeklyPatterns={setWeeklyPatterns}
                weeks={weeks}
                selectedWeek={selectedWeek}
                setSelectedWeek={setSelectedWeek}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                multiSelectAllow={multiSelectAllow}
              />
            )}
          </div>
        );

      case "YEARLY":
        return (
          <div className="space-y-4">
            {selectedMonth && selectedMonth?.length > 0 && (
              <div>
                <RadioGroup
                  value={dateOrWeekly}
                  onValueChange={(value: DateOrWeeklyType) => {
                    setDateOrWeekly(value);

                    if (value === "date") {
                      setSelectedWeek(null);
                      setWeeklyPatterns([{ week: null, daysOfWeek: [] }]);
                      setSelectedDay([]);
                    } else if (value === "WEEKLY") {
                      setSelectedDate(null);
                    }
                  }}
                  className="mt-2 flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="date" id="MONTHLY-date" />
                    <Label htmlFor="MONTHLY-date">Specific Date</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="WEEKLY" id="MONTHLY-WEEKLY" />
                    <Label htmlFor="MONTHLY-WEEKLY">Weekly Pattern</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            <DateSelector
              condition={
                selectedMonth &&
                selectedMonth?.length > 0 &&
                dateOrWeekly === "date"
              }
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              multiSelect={multiSelect}
              totalDays={totalDays}
            />
            {selectedMonth && dateOrWeekly === "WEEKLY" && (
              <WeeklyPatternSelector
                multiSelect={multiSelect}
                weeklyPatterns={weeklyPatterns}
                setWeeklyPatterns={setWeeklyPatterns}
                weeks={weeks}
                selectedWeek={selectedWeek}
                setSelectedWeek={setSelectedWeek}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                multiSelectAllow={multiSelectAllow}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };
  const isWeekly = baseFrequency === "WEEKLY";
  const customObj = {
    frequency: baseFrequency,
    ...(baseFrequency === "YEARLY" &&
      selectedMonth.length > 0 && {
        month: convertMonthToAPI(selectedMonth).filter(
          (m): m is string => !!m,
        )[0], // take only first value
      }),

    ...(isWeekly &&
      selectedDay.length > 0 && {
        daysOfWeek: convertDaysToAPI(selectedDay),
      }),
    ...(weeklyPatterns.some(
      (wp) => wp.week !== null && wp.daysOfWeek.length > 0,
    ) && {
      weekPatterns: weeklyPatterns
        .filter((wp) => wp.week !== null && wp.daysOfWeek.length > 0)
        .map((wp) => ({
          week: wp.week!,
          day:
            wp.daysOfWeek.length === 1
              ? daysarr.find((d) => d.key === wp.daysOfWeek[0])?.api || ""
              : wp.daysOfWeek
                  .map((k) => daysarr.find((d) => d.key === k)?.api)
                  .filter((d): d is string => !!d),
        })),
    }),
    ...(selectedDate && selectedDate.length > 0 ? { dates: selectedDate } : {}),
    ...(IntervalCount && { interval: IntervalCount }),
    timezone: "Asia/Kolkata",
    ...(baseFrequency === "MONTHLY" &&
      isMonthlyEnd && { endOfMonth: isMonthlyEnd }),
  };
  // console.log(customObj, "before save ");

  return (
    <ModalData
      isModalOpen={open}
      modalClose={() => onOpenChange(false)}
      modalTitle="Custom Repetition MEETING"
      containerClass="min-w-[40%] "
      childclass="py-1"
      buttons={[
        {
          btnText: "Save",
          btnClick: () => {
            onSave(customObj);
            onOpenChange(false);
          },
        },
        {
          btnText: "Cancel",
          btnClick: () => onOpenChange(false),
          buttonCss: "bg-gray-200 text-gray-700 hover:bg-gray-300",
        },
      ]}
    >
      <div className="space-y-2">
        <div className="flex gap-4 mb-3 flex-wrap items-end">
          <div className="flex flex-col w-[30%]">
            <Label className="mb-2">Repeat Type</Label>
            <Select
              value={baseFrequency}
              onValueChange={(val: FrequencyType) => {
                setFrequency(val);
                setSelectedDate(null);
                setSelectedWeek(null);
                setSelectedDay([]);
                setSelectedMonth([]);
                setIntervalCount(1);
                setDateOrWeekly("date");
                setWeeklyPatterns([{ week: null, daysOfWeek: [] }]);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {frequencies.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(baseFrequency === "WEEKLY" || baseFrequency === "MONTHLY") && (
            <div className="flex flex-col w-[20%]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium whitespace-nowrap">
                  Repeat Every
                </span>
                <div className="relative flex items-center">
                  <Input
                    type="number"
                    min={1}
                    className="w-15 pr-2"
                    value={IntervalCount}
                    onChange={(e) => setIntervalCount(Number(e.target.value))}
                  />

                  {/* Up/Down Buttons */}
                  <div className="absolute right-1 top-1 flex flex-col">
                    <button
                      type="button"
                      onClick={() => setIntervalCount((prev) => prev + 1)}
                      className="text-xs w-4 h-3 flex text-gray-500 items-center justify-center"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setIntervalCount((prev) => Math.max(1, prev - 1))
                      }
                      className="text-xs w-4 h-3 text-gray-500 flex items-center justify-center"
                    >
                      ▼
                    </button>
                  </div>
                </div>

                <span className="text-sm font-medium whitespace-nowrap">
                  {baseFrequency === "WEEKLY"
                    ? `Week${IntervalCount > 1 ? "s" : ""}`
                    : `Month${IntervalCount > 1 ? "s" : ""}`}
                </span>
              </div>
            </div>
          )}

          {baseFrequency === "YEARLY" && (
            <div className="flex flex-col w-[65%]">
              <Label className="mb-2">Select Month</Label>

              <FormSelect
                value={selectedMonth[0]?.toString() || ""}
                onChange={(val) => {
                  setSelectedMonth([Number(val)]);
                  setSelectedDate(null);
                }}
                options={reorderedMonths.map((m) => ({
                  value: String(m.value),
                  label: m.label,
                }))}
                className="w-full"
                placeholder="Choose month..."
                isMulti={false} // ✅ Force single select
                placeclassName="w-[65%] overflow-hidden text-ellipsis whitespace-nowrap truncate"
                triggerClassName="border px-3 py-2 mb-0"
              />
            </div>
          )}
        </div>

        {renderFrequencyFields()}

        {getScheduleSummary().trim() !== "Summary :" && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md">
              {getScheduleSummary()}
            </p>
          </div>
        )}
      </div>
    </ModalData>
  );
}
