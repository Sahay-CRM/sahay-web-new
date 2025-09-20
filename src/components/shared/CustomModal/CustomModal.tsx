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
import { Switch } from "@/components/ui/switch";
import { useCustomModalFile } from "./useCustomefile";
import FormSelect from "@/components/shared/Form/FormSelect";
import { useEffect } from "react";
import DaySelector from "../FormDateTimePicker/DaySelector";
import DateSelector from "../FormDateTimePicker/DateSelector";
import WeeklyPatternSelector from "../FormDateTimePicker/WeeklyPatternSelector";

type FrequencyType =
  | "WEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "HALFYEARLY"
  | "YEARLY";
type DateOrWeeklyType = "date" | "WEEKLY";

export default function CustomModalFile({
  open,
  onOpenChange,
  onSave,
  defaultValues,
}: CustomModalFileProps) {
  const {
    frequencies,
    halves,
    months,
    quarters,
    weeks,
    baseFrequency,
    dateOrWeekly,
    selectedDate,
    selectedHalf,
    selectedMonth,
    selectedQuarter,
    selectedWeek,
    selectedDay,
    weeklyPatterns,
    multiSelect,
    setFrequency,
    setDateOrWeekly,
    setSelectedDate,
    setSelectedHalf,
    setSelectedMonth,
    setSelectedQuarter,
    setSelectedWeek,
    setSelectedDay,
    setMultiSelect,
    setWeeklyPatterns,
    getScheduleSummary,
  } = useCustomModalFile(defaultValues);

  useEffect(() => {
    if (!multiSelect && selectedQuarter.length > 1) {
      setSelectedQuarter([selectedQuarter[0]]);
    }
  }, [multiSelect, selectedQuarter, setSelectedQuarter]);
  useEffect(() => {
    if (!multiSelect && selectedHalf.length > 1) {
      setSelectedHalf([selectedHalf[0]]);
    }
  }, [multiSelect, selectedHalf, setSelectedHalf]);
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
                // maxLength={2}
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

                  if (value === "date") {
                    setSelectedWeek(null);
                    setWeeklyPatterns([{ week: null, daysOfWeek: [] }]);
                    setSelectedDay([]);
                  } else if (value === "WEEKLY") {
                    setSelectedDate(null);
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
              />
            )}
          </div>
        );

      case "QUARTERLY":
        return (
          <div className="space-y-4">
            {/* Date or Weekly pattern */}
            {selectedQuarter && (
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
                    <RadioGroupItem value="date" id="QUARTERLY-date" />
                    <Label htmlFor="QUARTERLY-date">Specific Date</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="WEEKLY" id="QUARTERLY-WEEKLY" />
                    <Label htmlFor="QUARTERLY-WEEKLY">Weekly Pattern</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            <DateSelector
              condition={!!selectedQuarter && dateOrWeekly === "date"}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              multiSelect={multiSelect}
            />

            {selectedQuarter && dateOrWeekly === "WEEKLY" && (
              <WeeklyPatternSelector
                multiSelect={multiSelect}
                weeklyPatterns={weeklyPatterns}
                setWeeklyPatterns={setWeeklyPatterns}
                weeks={weeks}
                selectedWeek={selectedWeek}
                setSelectedWeek={setSelectedWeek}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
              />
            )}
          </div>
        );

      case "HALFYEARLY":
        return (
          <div className="space-y-4">
            {selectedHalf && (
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
              condition={!!selectedHalf && dateOrWeekly === "date"}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              multiSelect={multiSelect}
            />
            {selectedHalf && dateOrWeekly === "WEEKLY" && (
              <WeeklyPatternSelector
                multiSelect={multiSelect}
                weeklyPatterns={weeklyPatterns}
                setWeeklyPatterns={setWeeklyPatterns}
                weeks={weeks}
                selectedWeek={selectedWeek}
                setSelectedWeek={setSelectedWeek}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
              />
            )}
          </div>
        );

      case "YEARLY":
        return (
          <div className="space-y-4">
            {selectedMonth && (
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
              condition={!!selectedMonth && dateOrWeekly === "date"}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              multiSelect={multiSelect}
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
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ModalData
      isModalOpen={open}
      modalClose={() => onOpenChange(false)}
      modalTitle="Custom Repetition"
      containerClass="min-w-[40%] "
      childclass="py-1"
      buttons={[
        {
          btnText: "Save",
          btnClick: () => {
            const isWeekly = baseFrequency === "WEEKLY";
            const customObj = {
              baseFrequency,
              repeatPattern: {
                months:
                  baseFrequency === "YEARLY"
                    ? selectedMonth
                    : baseFrequency === "QUARTERLY"
                      ? selectedQuarter
                      : baseFrequency === "HALFYEARLY"
                        ? selectedHalf
                        : [],
                daysOfWeek: isWeekly ? (selectedDay ?? []) : [],
                weekDaysMapping: multiSelect
                  ? weeklyPatterns
                      .filter(
                        (wp) => wp.week !== null && wp.daysOfWeek.length > 0,
                      )
                      .map((wp) => ({
                        week: wp.week!,
                        daysOfWeek: wp.daysOfWeek,
                      }))
                  : selectedWeek && selectedDay?.length
                    ? [
                        {
                          week: selectedWeek,
                          daysOfWeek: selectedDay,
                        },
                      ]
                    : [],
                multiSelect: multiSelect,
                dates: selectedDate ?? [],
              },
            };
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
        <div className="flex justify-end gap-4 flex-wrap">
          <Label htmlFor="multi-select" className="mb-1">
            Multi Select
          </Label>
          <Switch
            id="multi-select"
            checked={multiSelect}
            onCheckedChange={setMultiSelect}
          />
        </div>
        <div className="flex gap-4 mb-3 flex-wrap items-end">
          {/* Repeat Type */}
          <div className="flex flex-col w-[30%]">
            <Label className="mb-2">Repeat Type</Label>
            <Select
              value={baseFrequency}
              onValueChange={(val: FrequencyType) => {
                setFrequency(val);
                setSelectedDate(null);
                setSelectedWeek(null);
                setSelectedDay([]);
                setSelectedQuarter([]);
                setSelectedHalf([]);
                setSelectedMonth([]);
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

          {/* Conditional Dropdown */}
          {baseFrequency === "QUARTERLY" && (
            <div className="flex flex-col  w-[65%]">
              <Label className="mb-2">Select Quarter</Label>
              <FormSelect
                value={
                  multiSelect
                    ? selectedQuarter.map(String)
                    : selectedQuarter[0]?.toString() || ""
                }
                onChange={(val) =>
                  multiSelect
                    ? setSelectedQuarter(
                        Array.isArray(val) ? val.map(Number) : [Number(val)],
                      )
                    : setSelectedQuarter([Number(val)])
                }
                options={quarters.map((q) => ({
                  value: String(q.value),
                  label: q.label,
                }))}
                className="w-full"
                placeholder="Choose quarter..."
                isMulti={multiSelect}
                placeclassName="w-[65%] overflow-hidden text-ellipsis whitespace-nowrap truncate"
                triggerClassName="border px-3  py-2 mb-0"
              />
            </div>
          )}

          {baseFrequency === "HALFYEARLY" && (
            <div className="flex flex-col w-[65%]">
              <Label className="mb-2">Select Half</Label>
              <FormSelect
                value={
                  multiSelect
                    ? selectedHalf.map(String)
                    : selectedHalf[0]?.toString() || ""
                }
                onChange={(val) =>
                  multiSelect
                    ? setSelectedHalf(
                        Array.isArray(val) ? val.map(Number) : [Number(val)],
                      )
                    : setSelectedHalf([Number(val)])
                }
                options={halves.map((h) => ({
                  value: String(h.value),
                  label: h.label,
                }))}
                className="w-full"
                placeholder="Choose half..."
                isMulti={multiSelect}
                placeclassName="w-[65%] overflow-hidden text-ellipsis whitespace-nowrap truncate"
                triggerClassName="border px-3  py-2 mb-0"
              />
            </div>
          )}

          {baseFrequency === "YEARLY" && (
            <div className="flex flex-col w-[65%]">
              <Label className="mb-2">Select Month</Label>
              <FormSelect
                value={
                  multiSelect
                    ? selectedMonth.map(String)
                    : selectedMonth[0]?.toString() || ""
                }
                onChange={(val) =>
                  multiSelect
                    ? setSelectedMonth(
                        Array.isArray(val) ? val.map(Number) : [Number(val)],
                      )
                    : setSelectedMonth([Number(val)])
                }
                options={months.map((m) => ({
                  value: String(m.value),
                  label: m.label,
                }))}
                className="w-full"
                placeholder="Choose month..."
                isMulti={multiSelect}
                placeclassName="w-[65%] overflow-hidden text-ellipsis whitespace-nowrap truncate"
                triggerClassName="border px-3  py-2 mb-0"
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
