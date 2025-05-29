import { useState } from "react";
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
};

export default function ScoreDataTable({
  data,
  onChange,
}: EditableScoreTableProps) {
  const [scores, setScores] = useState<SubParameterScore[]>(data);

  const handleScoreClick = (id: string, value: number) => {
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
                      const isSelected = value <= param.score;
                      const isActive = value === param.score;

                      return (
                        <button
                          key={value}
                          onClick={() =>
                            handleScoreClick(param.subParameterId, value)
                          }
                          className={cn(
                            "h-5 w-5 rounded-full border border-gray-300 transition-all",
                            isSelected ? "bg-blue-500" : "bg-gray-200",
                            isActive && "ring-2 ring-blue-600",
                          )}
                        />
                      );
                    })}
                  </div>
                  {/* Numbers below dots */}
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    {Array.from({ length: 10 }, (_, i) => (
                      <span key={i} className="w-5 text-center">
                        {i + 1}
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
