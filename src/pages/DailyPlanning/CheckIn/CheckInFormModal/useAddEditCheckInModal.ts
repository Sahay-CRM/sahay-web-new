import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { format } from "date-fns";

import { getUserId } from "@/features/selectors/auth.selector";
import useAddDailyPlanItem from "@/features/api/dailyPlan/useAddDailyPlanItem";
import useUpdateDailyPlanItem from "@/features/api/dailyPlan/useUpdateDailyPlanItem";
import useGetCompanyTaskSearch from "@/features/api/companyTask/useGetCompanyTaskSearch";
import useGetCompanyMeetingSearch from "@/features/api/companyMeeting/useGetCompanyMeetingSearch";

interface UseAddEditCheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialItem?: DailyPlanItem | null;
}

export interface DropdownOptionItem {
  value: string;
  label: string;
  isHeader?: boolean;
  isFooterNote?: boolean;
}

export default function useAddEditCheckInModal({
  open,
  onOpenChange,
  initialItem,
}: UseAddEditCheckInModalProps) {
  const employeeId = useSelector(getUserId);
  const todayDate = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const [type, setType] = useState<DailyPlanItemType>("TASK");
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [selectedRefId, setSelectedRefId] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [priority, setPriority] = useState<string>("Medium");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState<{
    title?: string;
    estimatedTime?: string;
    priority?: string;
  }>({});

  const { mutate: addItem, isPending: isAdding } = useAddDailyPlanItem();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateDailyPlanItem();

  const isPending = isAdding || isUpdating;

  // Task Search API call when type is TASK with planingtask: true
  const { data: taskSearchData } = useGetCompanyTaskSearch(
    type === "TASK" ? search : "",
    true
  );

  // Meeting Search API call when type is MEETING with detailMeetingStatus: true
  const { data: meetingSearchData } = useGetCompanyMeetingSearch(
    type === "MEETING" ? search : "",
    true
  );

  const taskOptions = useMemo<DropdownOptionItem[]>(() => {
    const rawData = taskSearchData?.data;
    if (!rawData) return [];

    const isGrouped = rawData && typeof rawData === "object" && "normal" in rawData;
    const normal = isGrouped ? (rawData as GroupedTaskSearchResponse).normal : [];
    const repeat = isGrouped ? (rawData as GroupedTaskSearchResponse).repeat : [];

    const options: DropdownOptionItem[] = [];

    if (normal.length > 0) {
      options.push({ value: "header-task-normal", label: "Normal Tasks", isHeader: true });
      normal.forEach((t: TaskSearchItem) => {
        if (t.taskId) {
          options.push({
            value: t.taskId,
            label: t.taskName || "",
          });
        }
      });
    }

    if (repeat.length > 0) {
      options.push({ value: "header-task-repeat", label: "Repeat Tasks", isHeader: true });
      repeat.forEach((t: TaskSearchItem) => {
        if (t.taskId) {
          options.push({
            value: t.taskId,
            label: t.taskName || "",
          });
        }
      });
    }

    if (options.length === 0 && Array.isArray(rawData)) {
      rawData.forEach((t: TaskSearchItem) => {
        if (t.taskId) {
          options.push({
            value: t.taskId,
            label: t.taskName || "",
          });
        }
      });
    }

    if (options.length > 0) {
      options.push({
        value: "footer-task-note",
        label: "To find other tasks, please search task name above...",
        isFooterNote: true,
      });
    }

    if (initialItem && initialItem.type === "TASK" && initialItem.taskId) {
      const exists = options.some((o) => o.value === initialItem.taskId);
      if (!exists) {
        const normalHeaderIndex = options.findIndex((o) => o.value === "header-task-normal");
        const newItem = {
          value: initialItem.taskId,
          label: initialItem.task?.taskName || initialItem.title || "Selected Task",
        };
        if (normalHeaderIndex !== -1) {
          options.splice(normalHeaderIndex + 1, 0, newItem);
        } else {
          options.unshift(
            { value: "header-task-normal", label: "Normal Tasks", isHeader: true },
            newItem
          );
        }
      }
    }

    return options;
  }, [taskSearchData, initialItem]);

  const meetingOptions = useMemo<DropdownOptionItem[]>(() => {
    const rawData = meetingSearchData?.data;
    if (!rawData) return [];

    const isGrouped = rawData && typeof rawData === "object" && "normal" in rawData;
    const normal = isGrouped ? (rawData as DetailedMeetingSearchGroup).normal : [];
    const detail = isGrouped ? (rawData as DetailedMeetingSearchGroup).detail : [];

    const options: DropdownOptionItem[] = [];

    if (normal.length > 0) {
      options.push({ value: "header-normal", label: "Normal Meetings", isHeader: true });
      normal.forEach((m: MeetingSearchItem) => {
        if (m.meetingId) {
          options.push({
            value: m.meetingId,
            label: m.meetingName || "",
          });
        }
      });
    }

    if (detail.length > 0) {
      options.push({ value: "header-detail", label: "Detail Meetings", isHeader: true });
      detail.forEach((m: MeetingSearchItem) => {
        if (m.meetingId) {
          options.push({
            value: m.meetingId,
            label: m.meetingName || "",
          });
        }
      });
    }

    if (options.length === 0 && Array.isArray(rawData)) {
      rawData.forEach((m: MeetingSearchItem) => {
        if (m.meetingId) {
          options.push({
            value: m.meetingId,
            label: m.meetingName || "",
          });
        }
      });
    }

    if (options.length > 0) {
      options.push({
        value: "footer-note",
        label: "To find other meetings, please search meeting name above...",
        isFooterNote: true,
      });
    }

    return options;
  }, [meetingSearchData]);

  const refOptions: DropdownOptionItem[] = type === "TASK" ? taskOptions : meetingOptions;

  const typeOptions = [
    { label: "Task", value: "TASK" },
    { label: "Meeting", value: "MEETING" },
  ];

  const priorityOptions = [
    { label: "High", value: "High" },
    { label: "Medium", value: "Medium" },
    { label: "Low", value: "Low" },
  ];

  useEffect(() => {
    if (initialItem) {
      setType(initialItem.type || "TASK");
      const currentTitle =
        initialItem.title ||
        initialItem.task?.taskName ||
        initialItem.meeting?.meetingName ||
        "";
      setTitle(currentTitle);
      setSelectedRefId(initialItem.taskId || initialItem.meetingId || "");
      
      const totalMins = initialItem.estimatedTime || 0;
      const hrs = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      setEstimatedHours(hrs > 0 ? String(hrs) : "");
      setEstimatedMinutes(mins > 0 ? String(mins) : "");
      
      setPriority(initialItem.priority || "Medium");
      setRemarks(initialItem.remarks || "");
    } else {
      setType("TASK");
      setTitle("");
      setSearch("");
      setSelectedRefId("");
      setEstimatedHours("");
      setEstimatedMinutes("");
      setPriority("Medium");
      setRemarks("");
    }
    setErrors({});
  }, [initialItem, open]);

  const validate = () => {
    const newErrors: {
      title?: string;
      estimatedTime?: string;
    } = {};

    if (!title.trim() && !selectedRefId) {
      newErrors.title = "Title or selection is required";
    }
    
    const totalMinutes = (Number(estimatedHours) || 0) * 60 + (Number(estimatedMinutes) || 0);
    if (totalMinutes <= 0) {
      newErrors.estimatedTime = "Estimated time must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleModalClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const finalTitle =
      title.trim() ||
      refOptions.find((o) => !o.isHeader && !o.isFooterNote && o.value === selectedRefId)?.label ||
      "";

    const totalMinutes = (Number(estimatedHours) || 0) * 60 + (Number(estimatedMinutes) || 0);

    if (initialItem?.planItemId) {
      updateItem(
        {
          planItemId: initialItem.planItemId,
          type,
          title: finalTitle,
          estimatedTime: totalMinutes,
          priority,
          remarks: remarks.trim() || undefined,
        },
        {
          onSuccess: () => {
            handleModalClose();
          },
        }
      );
    } else {
      addItem(
        {
          employeeId,
          date: todayDate,
          type,
          title: finalTitle,
          priority,
          estimatedTime: totalMinutes,
          remarks: remarks.trim() || undefined,
          taskId: type === "TASK" ? selectedRefId || undefined : undefined,
          meetingId: type === "MEETING" ? selectedRefId || undefined : undefined,
        },
        {
          onSuccess: () => {
            handleModalClose();
          },
        }
      );
    }
  };

  return {
    type,
    setType,
    title,
    setTitle,
    search,
    setSearch,
    selectedRefId,
    setSelectedRefId,
    estimatedHours,
    setEstimatedHours,
    estimatedMinutes,
    setEstimatedMinutes,
    priority,
    setPriority,
    remarks,
    setRemarks,
    errors,
    setErrors,
    refOptions,
    typeOptions,
    priorityOptions,
    handleSubmit,
    handleModalClose,
    isPending,
  };
}
