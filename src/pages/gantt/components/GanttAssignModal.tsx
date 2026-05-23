import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAssignGanttItem } from "@/features/api/gantt";
import type { CompanyGanttItem } from "@/types/gantt";
import { useQuery } from "@tanstack/react-query";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { getInitials } from "@/pages/gantt/utils/gantt.utils";
import { SpinnerIcon } from "@/components/shared/Icons";

interface Employee {
  employeeId: string;
  employeeName: string;
  designation?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: CompanyGanttItem;
  workspaceId: string;
}

export default function GanttAssignModal({
  open,
  onOpenChange,
  item,
  workspaceId,
}: Props) {
  const [search, setSearch] = useState("");
  const mutation = useAssignGanttItem(workspaceId);

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employee-dd-all"],
    queryFn: async () => {
      const { data } = await Api.get<{ data: Employee[] }>({
        url: Urls.getAllEmployeeDd(),
      });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const filtered = (employees ?? []).filter((e) =>
    e.employeeName?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAssign = async (employeeId: string | null) => {
    await mutation.mutateAsync({
      itemId: item.ganttItemId,
      payload: { assignedToEmployeeId: employeeId },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign Employee</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground truncate">
            Assigning:{" "}
            <span className="font-medium text-foreground">{item.itemName}</span>
          </p>

          {item.assignedEmployee?.employeeName && (
            <div className="flex items-center justify-between rounded-md border px-3 py-2 bg-muted/30">
              <span className="text-sm">
                Current:{" "}
                <span className="font-medium">
                  {item.assignedEmployee.employeeName}
                </span>
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => handleAssign(null)}
                disabled={mutation.isPending}
              >
                Unassign
              </Button>
            </div>
          )}

          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
          />

          <div className="max-h-56 overflow-y-auto space-y-1">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <SpinnerIcon className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                No employees found.
              </p>
            ) : (
              filtered.map((emp) => (
                <button
                  key={emp.employeeId}
                  type="button"
                  onClick={() => handleAssign(emp.employeeId)}
                  disabled={mutation.isPending}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted text-left text-sm transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {getInitials(emp.employeeName)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{emp.employeeName}</p>
                    {emp.designation && (
                      <p className="text-xs text-muted-foreground truncate">
                        {emp.designation}
                      </p>
                    )}
                  </div>
                  {item.assignedToEmployeeId === emp.employeeId && (
                    <Badge className="ml-auto text-[10px]" variant="outline">
                      Assigned
                    </Badge>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
