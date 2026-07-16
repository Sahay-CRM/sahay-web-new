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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SearchDropdown from "@/components/shared/Form/SearchDropdown/searchDropdown";
import useGetCompanyTaskSearch from "@/features/api/companyTask/useGetCompanyTaskSearch";
import useGetMeetingSearch from "@/features/api/companyMeeting/useGetMeetingSearch";
import useAddDailyPlanItem from "@/features/api/dailyPlan/useAddDailyPlanItem";

interface AddDailyPlanItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  employeeId?: string;
}

export default function AddDailyPlanItemDialog({
  open,
  onOpenChange,
  date,
  employeeId,
}: AddDailyPlanItemDialogProps) {
  const [type, setType] = useState<DailyPlanItemType>("TASK");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [remarks, setRemarks] = useState("");

  const { data: taskSearchData } = useGetCompanyTaskSearch(
    type === "TASK" ? search : "",
  );
  const { data: meetingSearchData } = useGetMeetingSearch(
    type === "MEETING" ? search : "",
  );

  const { mutate: addItem, isPending } = useAddDailyPlanItem();

  const taskOptions =
    taskSearchData?.data?.map((t) => ({
      value: t.taskId,
      label: t.taskName,
    })) || [];

  const meetingOptions = [
    ...(meetingSearchData?.data?.normal || []),
    ...(meetingSearchData?.data?.detail || []),
  ].map((m) => ({
    value: m.meetingId,
    label: m.meetingName,
  }));

  const options = type === "TASK" ? taskOptions : meetingOptions;

  const resetForm = () => {
    setType("TASK");
    setSearch("");
    setSelectedId("");
    setEstimatedTime("");
    setRemarks("");
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  const handleSubmit = () => {
    if (!selectedId || !estimatedTime) return;

    const payload: AddDailyPlanItemPayload = {
      employeeId,
      date,
      type,
      estimatedTime: Number(estimatedTime),
      remarks: remarks || undefined,
      ...(type === "TASK" ? { taskId: selectedId } : { meetingId: selectedId }),
    };

    addItem(payload, {
      onSuccess: () => {
        handleClose(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Item to Plan</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select
              value={type}
              onValueChange={(val) => {
                setType(val as DailyPlanItemType);
                setSelectedId("");
                setSearch("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TASK">Task</SelectItem>
                <SelectItem value="MEETING">Meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>{type === "TASK" ? "Select Task" : "Select Meeting"}</Label>
            <SearchDropdown
              options={options}
              selectedValues={selectedId ? [selectedId] : []}
              onSearchChange={setSearch}
              onSelect={(item) => setSelectedId(item.value)}
              placeholder={
                type === "TASK" ? "Search tasks..." : "Search meetings..."
              }
            />
            {type === "TASK" &&
              search.trim().length > 0 &&
              search.trim().length < 3 && (
                <p className="text-xs text-muted-foreground">
                  Type at least 5 characters to search tasks.
                </p>
              )}
          </div>

          <div className="grid gap-2">
            <Label>Estimated Time (mins)</Label>
            <Input
              type="number"
              min={1}
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="e.g. 30"
            />
          </div>

          <div className="grid gap-2">
            <Label>Remarks</Label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional notes about this item"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedId || !estimatedTime || isPending}
          >
            {isPending ? "Adding..." : "Add to Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
