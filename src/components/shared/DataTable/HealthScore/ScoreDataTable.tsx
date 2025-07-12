import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

export type SubParameterScore = {
  subParameterId: string;
  name: string;
  score: number;
  isDisabled?: boolean;
  isActive?: boolean;
};

type EditableScoreTableProps = {
  data: SubParameterScore[];
  onChange?: (updated: SubParameterScore[]) => void;
  disabled?: boolean;
  mode?: "percent" | "number";
  onSwitchChange?: (switchStates: Record<string, boolean>) => void;
  rowIsDisabled?: (row: SubParameterScore) => boolean;
  showSwitch?: boolean; // <-- add this line
};

export default function ScoreDataTable({
  data,
  onChange,
  disabled = false,
  mode = "percent",
  onSwitchChange,
  rowIsDisabled,
  showSwitch = true,
}: EditableScoreTableProps) {
  const [scores, setScores] = useState<SubParameterScore[]>(data);

  // Track switch state for each row
  const [switchStates, setSwitchStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Set switch ON if isDisabled is true, OFF if false
    setSwitchStates(
      data.reduce(
        (acc, item) => {
          acc[item.subParameterId] = !!item.isDisabled;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
    );
    setScores(data);
  }, [data]);

  const handleScoreClick = (id: string, value: number) => {
    if (disabled) return;
    const updated = scores.map((item) =>
      item.subParameterId === id
        ? { ...item, score: item.score === value ? 0 : value }
        : item,
    );
    setScores(updated);
    onChange?.(updated);
  };

  const handleSwitchChange = (id: string, checked: boolean) => {
    setSwitchStates((prev) => {
      const updated = { ...prev, [id]: checked };
      onSwitchChange?.(updated);
      return updated;
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">Key Result Area Name</TableHead>
            <TableHead className="text-center">Score</TableHead>
            {showSwitch && (
              <TableHead className="text-center">Disabled</TableHead>
            )}
            {/* New column */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {scores.map((param) => (
            <TableRow
              key={param.subParameterId}
              className={cn(param.isDisabled === true ? "bg-gray-200" : "")}
            >
              <TableCell className="font-medium">{param.name}</TableCell>
              <TableCell>
                <div className="flex flex-col items-center justify-center gap-1">
                  {/* Dots */}
                  <div className="flex gap-2">
                    {Array.from({ length: 10 }, (_, i) => {
                      const value = i + 1;
                      let isSelected, isActive, handleValue;
                      if (mode === "percent") {
                        const selectedDots = Math.ceil(param.score / 10);
                        isSelected = value <= selectedDots;
                        isActive = value === selectedDots;
                        handleValue = value * 10;
                      } else {
                        isSelected = value <= param.score;
                        isActive = value === param.score;
                        handleValue = value;
                      }
                      return (
                        <button
                          key={value}
                          disabled={disabled || param.isDisabled === true}
                          onClick={() => {
                            if (disabled || param.isDisabled === true) return;
                            handleScoreClick(param.subParameterId, handleValue);
                          }}
                          className={cn(
                            "h-5 w-5 rounded-full border border-gray-300 transition-all",
                            isSelected ? "bg-[#30338d]" : "bg-gray-200",
                            isActive && "ring-2 ring-[#30338d]",
                            (disabled || param.isDisabled === true) &&
                              "cursor-not-allowed opacity-80",
                          )}
                        />
                      );
                    })}
                  </div>
                  {/* Numbers below dots */}
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    {Array.from({ length: 10 }, (_, i) => (
                      <span key={i} className="w-5 text-center">
                        {mode === "percent" ? (i + 1) * 10 + "%" : i + 1}
                      </span>
                    ))}
                  </div>
                </div>
              </TableCell>
              {showSwitch && (
                <TableCell className="text-center">
                  <Switch
                    checked={!!switchStates[param.subParameterId]}
                    onCheckedChange={(checked) =>
                      !disabled &&
                      handleSwitchChange(param.subParameterId, checked)
                    }
                    className={cn(
                      (disabled ||
                        (typeof rowIsDisabled === "function"
                          ? rowIsDisabled(param)
                          : false)) &&
                        "cursor-pointer ",
                    )}
                    disabled={disabled}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
