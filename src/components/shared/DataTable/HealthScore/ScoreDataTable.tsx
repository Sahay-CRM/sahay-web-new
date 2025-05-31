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

export type SubParameterScore = {
  subParameterId: string;
  name: string;
  score: number;
};

type EditableScoreTableProps = {
  data: SubParameterScore[];
  onChange?: (updated: SubParameterScore[]) => void;
  disabled?: boolean;
  mode?: "percent" | "number"; // <-- add mode prop
};

export default function ScoreDataTable({
  data,
  onChange,
  disabled = false,
  mode = "percent", // <-- default to percent
}: EditableScoreTableProps) {
  const [scores, setScores] = useState<SubParameterScore[]>(data);

  useEffect(() => {
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">Sub Parameter Name</TableHead>
            <TableHead className="text-center">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scores.map((param) => (
            <TableRow key={param.subParameterId}>
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
                          disabled={disabled}
                          onClick={() =>
                            handleScoreClick(param.subParameterId, handleValue)
                          }
                          className={cn(
                            "h-5 w-5 rounded-full border border-gray-300 transition-all",
                            isSelected ? "bg-[#30338d]" : "bg-gray-200",
                            isActive && "ring-2 ring-[#30338d]",
                            disabled && "cursor-not-allowed opacity-80",
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
