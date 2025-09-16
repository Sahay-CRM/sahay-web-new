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
import DaySelector from "./DaySelector";
import { useCustomModalFile } from "./useCustomefile";

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
    getScheduleSummary,
  } = useCustomModalFile(defaultValues);

  const renderFrequencyFields = () => {
    switch (baseFrequency) {
      case "WEEKLY": {
        return (
          <div className="  w-1/2  space-y-4">
            <div className="flex justify-between mr-10 space-x-2">
              <Label className="mb-2">Select Day</Label>
              <Switch
                id="multi-select"
                checked={multiSelect}
                onCheckedChange={setMultiSelect}
              />
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
          <div className="space-y-4">
            <div>
              <RadioGroup
                value={dateOrWeekly}
                onValueChange={(value: DateOrWeeklyType) => {
                  setDateOrWeekly(value);

                  if (value === "date") {
                    setSelectedWeek("");
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

            {dateOrWeekly === "date" && (
              <div>
                <Label className="text-sm font-medium mb-2">Select Date</Label>
                <div className=" grid grid-cols-15 gap-1">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() =>
                        setSelectedDate(selectedDate === date ? null : date)
                      }
                      className={`w-10 h-10 rounded-md border flex items-center justify-center transition
            ${
              selectedDate === date
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {dateOrWeekly === "WEEKLY" && (
              <div className="flex items-start gap-6">
                {/* Week selector */}
                <div className="w-50">
                  <Label className="text-sm font-medium">Select Week</Label>
                  <Select
                    value={selectedWeek !== null ? String(selectedWeek) : ""} // UI ke liye string
                    onValueChange={(value) => setSelectedWeek(Number(value))} // convert to number
                  >
                    <SelectTrigger className="mt-2 w-50">
                      <SelectValue placeholder="Choose week..." />
                    </SelectTrigger>
                    <SelectContent>
                      {weeks.map((week) => (
                        <SelectItem key={week.value} value={String(week.value)}>
                          {week.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Day selector */}
                {selectedWeek && (
                  <div className="flex-1 max-w-fit">
                    <div className="flex mb-2 items-center justify-between">
                      <Label
                        htmlFor="multi-select"
                        className="text-sm font-medium"
                      >
                        Select Day
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="multi-select"
                          checked={multiSelect}
                          onCheckedChange={setMultiSelect}
                        />
                      </div>
                    </div>

                    <DaySelector
                      value={selectedDay}
                      onChange={setSelectedDay}
                      multiSelectAllow={multiSelect}
                      // alternateDay
                      // maxLength={2}
                    />
                  </div>
                )}
              </div>
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
                      setSelectedWeek("");
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

            {selectedQuarter && dateOrWeekly === "date" && (
              <div>
                <Label className="text-sm font-medium">Select Date</Label>
                <div className="mt-2 grid grid-cols-15 gap-1">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() =>
                        setSelectedDate(selectedDate === date ? null : date)
                      }
                      className={`w-10 h-10 rounded-md border text-xs flex items-center justify-center transition
                  ${
                    selectedDate === date
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedQuarter && dateOrWeekly === "WEEKLY" && (
              <div className="flex items-start gap-6">
                <div className="w-50">
                  <Label className="text-sm font-medium">Select Week</Label>
                  <Select
                    value={selectedWeek !== null ? String(selectedWeek) : ""} // UI ke liye string
                    onValueChange={(value) => setSelectedWeek(Number(value))}
                  >
                    <SelectTrigger className="mt-2 w-50">
                      <SelectValue placeholder="Choose week..." />
                    </SelectTrigger>
                    <SelectContent>
                      {weeks.map((week) => (
                        <SelectItem key={week.value} value={String(week.value)}>
                          {week.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedWeek && (
                  <div className="flex-1 max-w-fit">
                    <div className="flex mb-2 items-center justify-between">
                      <Label
                        htmlFor="multi-select"
                        className="text-sm font-medium"
                      >
                        Select Day
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="multi-select"
                          checked={multiSelect}
                          onCheckedChange={setMultiSelect}
                        />
                      </div>
                    </div>

                    <DaySelector
                      value={selectedDay}
                      onChange={setSelectedDay}
                      multiSelectAllow={multiSelect}
                      // alternateDay
                      // maxLength={2}
                    />
                  </div>
                )}
              </div>
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
                      setSelectedWeek("");
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

            {selectedHalf && dateOrWeekly === "date" && (
              <div>
                <Label
                  htmlFor="HALFYEARLY-date-picker"
                  className="text-sm font-medium"
                >
                  Select Date
                </Label>
                <div className="mt-2 grid grid-cols-15 gap-1">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() =>
                        setSelectedDate(selectedDate === date ? null : date)
                      }
                      className={`w-10 h-10 rounded-md border text-xs flex items-center justify-center transition
                  ${
                    selectedDate === date
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedHalf && dateOrWeekly === "WEEKLY" && (
              <div className="flex items-start gap-6">
                <div className="w-50">
                  <Label className="text-sm font-medium">Select Week</Label>
                  <Select
                    value={selectedWeek !== null ? String(selectedWeek) : ""} // UI ke liye string
                    onValueChange={(value) => setSelectedWeek(Number(value))}
                  >
                    <SelectTrigger className="mt-2 w-50">
                      <SelectValue placeholder="Choose week..." />
                    </SelectTrigger>
                    <SelectContent>
                      {weeks.map((week) => (
                        <SelectItem key={week.value} value={String(week.value)}>
                          {week.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedWeek && (
                  <div className="flex-1 max-w-fit">
                    <div className="flex mb-2 items-center justify-between">
                      <Label
                        htmlFor="multi-select"
                        className="text-sm font-medium"
                      >
                        Select Day
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="multi-select"
                          checked={multiSelect}
                          onCheckedChange={setMultiSelect}
                        />
                      </div>
                    </div>

                    <DaySelector
                      value={selectedDay}
                      onChange={setSelectedDay}
                      multiSelectAllow={multiSelect}
                      // alternateDay
                      // maxLength={2}
                    />
                  </div>
                )}
              </div>
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
                      setSelectedWeek("");
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

            {selectedMonth && dateOrWeekly === "date" && (
              <div>
                <Label
                  htmlFor="HALFYEARLY-date-picker"
                  className="text-sm font-medium"
                >
                  Select Date
                </Label>
                <div className="mt-2 grid grid-cols-15 gap-1">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() =>
                        setSelectedDate(selectedDate === date ? null : date)
                      }
                      className={`w-10 h-10 rounded-md border text-xs flex items-center justify-center transition
                  ${
                    selectedDate === date
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedMonth && dateOrWeekly === "WEEKLY" && (
              <div className="flex items-start gap-6">
                <div className="w-50">
                  <Label className="text-sm font-medium">Select Week</Label>
                  <Select
                    value={selectedWeek !== null ? String(selectedWeek) : ""}
                    onValueChange={(value) => setSelectedWeek(Number(value))}
                  >
                    <SelectTrigger className="mt-2 w-50">
                      <SelectValue placeholder="Choose week..." />
                    </SelectTrigger>
                    <SelectContent>
                      {weeks.map((week) => (
                        <SelectItem key={week.value} value={String(week.value)}>
                          {week.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedWeek && (
                  <div className="flex-1 max-w-fit">
                    <div className="flex mb-2 items-center justify-between">
                      <Label
                        htmlFor="multi-select"
                        className="text-sm font-medium"
                      >
                        Select Day
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="multi-select"
                          checked={multiSelect}
                          onCheckedChange={setMultiSelect}
                        />
                      </div>
                    </div>

                    <DaySelector
                      value={selectedDay}
                      onChange={setSelectedDay}
                      multiSelectAllow={multiSelect}
                      // alternateDay
                      // maxLength={2}
                    />
                  </div>
                )}
              </div>
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
      containerClass="   min-w-[40%] "
      buttons={[
        {
          btnText: "Save",
          btnClick: () => {
            // console.log({
            //   baseFrequency,
            //   dateOrWeekly,
            //   date: selectedDate,
            //   nWeek: selectedWeek,
            //   days: selectedDay,
            // });
            const data = {
              baseFrequency,
              date: selectedDate,
              nWeek: selectedWeek,
              days: selectedDay,
              qMonth: selectedQuarter,
              hMonth: selectedHalf,
              month: selectedMonth,
            };

            onSave(data);
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
      <div className="space-y-4">
        <div className="flex items-end gap-6">
          <div className="flex-1">
            <Label className="mb-2">Repeat Type</Label>
            <Select
              value={baseFrequency}
              onValueChange={(val: FrequencyType) => {
                setFrequency(val);
                setSelectedDate(null);
                setSelectedWeek("");
                setSelectedDay([]);
                setSelectedQuarter("");
                setSelectedHalf("");
                setSelectedMonth(null);
                setDateOrWeekly("date");
                setMultiSelect(false);
              }}
            >
              <SelectTrigger className="w-80 mt-1">
                <SelectValue placeholder="Select requency" />
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

          {baseFrequency === "QUARTERLY" && (
            <div className="flex-1">
              <Label className="text-sm font-medium">Select Quarter</Label>
              <Select
                value={selectedQuarter !== null ? String(selectedQuarter) : ""}
                onValueChange={(value) => setSelectedQuarter(Number(value))}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Choose quarter..." />
                </SelectTrigger>
                <SelectContent>
                  {quarters.map((quarter) => (
                    <SelectItem
                      key={quarter.value}
                      value={String(quarter.value)}
                    >
                      {quarter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {baseFrequency === "HALFYEARLY" && (
            <div className="flex-1">
              <Label className="text-sm font-medium">Select Half</Label>
              <Select
                value={selectedHalf !== null ? String(selectedHalf) : ""}
                onValueChange={(value) => setSelectedHalf(Number(value))}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Choose half..." />
                </SelectTrigger>
                <SelectContent>
                  {halves.map((half) => (
                    <SelectItem key={half.value} value={String(half.value)}>
                      {half.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {baseFrequency === "YEARLY" && (
            <div className="flex-1">
              <Label className="text-sm font-medium">Select Month</Label>
              <Select
                value={selectedMonth ? String(selectedMonth) : ""}
                onValueChange={(val) => setSelectedMonth(Number(val))}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Choose month..." />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={String(month.value)}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {renderFrequencyFields()}
        {getScheduleSummary().trim() !== "Summary :" && (
          <div className="pt-4 border-gray-200">
            <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md">
              {getScheduleSummary()}
            </p>
          </div>
        )}
      </div>
    </ModalData>
  );
}
