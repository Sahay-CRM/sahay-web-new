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
  items: DailyPlanItem[];
  companyWorkingMinutes: number;
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
  items,
  companyWorkingMinutes,
}: UseAddEditCheckInModalProps) {
  const employeeId = useSelector(getUserId);
  const todayDate = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const [type, setType] = useState<DailyPlanItemType>("TASK");
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [selectedRefId, setSelectedRefId] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState<{
    title?: string;
    estimatedTime?: string;
  }>({});

  const isInputOvertime = useMemo(() => {
    const otherItemsMinutes = items
      .filter((item) => !initialItem || item.planItemId !== initialItem.planItemId)
      .reduce((acc, item) => acc + (item.estimatedTime || 0), 0);
    const currentInputMinutes = (Number(estimatedHours) || 0) * 60 + (Number(estimatedMinutes) || 0);
    return (otherItemsMinutes + currentInputMinutes) > companyWorkingMinutes;
  }, [items, initialItem, estimatedHours, estimatedMinutes, companyWorkingMinutes]);

  const { mutate: addItem, isPending: isAdding } = useAddDailyPlanItem();
  const { mutate: updateItem, isPending: isUpdating } =
    useUpdateDailyPlanItem();

  const isPending = isAdding || isUpdating;

  const isTaskSearchEnabled = type === "TASK" && search.trim().length > 0;
  const { data: taskSearchData } = useGetCompanyTaskSearch(
    isTaskSearchEnabled ? search : "",
    true,
    isTaskSearchEnabled,
  );

  const isMeetingSearchEnabled = type === "MEETING" && search.trim().length > 0;
  const { data: meetingSearchData } = useGetCompanyMeetingSearch(
    isMeetingSearchEnabled ? search : "",
    true,
    isMeetingSearchEnabled,
  );

  const taskOptions = useMemo<DropdownOptionItem[]>(() => {
    if (!search.trim()) {
      if (selectedRefId && type === "TASK") {
        return [{ value: selectedRefId, label: title }];
      }
      return [];
    }
    const rawData = taskSearchData?.data;
    if (!rawData) return [];

    const isGrouped =
      rawData && typeof rawData === "object" && "normal" in rawData;
    const normal = isGrouped
      ? (rawData as GroupedTaskSearchResponse).normal
      : [];
    const repeat = isGrouped
      ? (rawData as GroupedTaskSearchResponse).repeat
      : [];

    const options: DropdownOptionItem[] = [];

    if (normal.length > 0) {
      options.push({
        value: "header-task-normal",
        label: "Normal Tasks",
        isHeader: true,
      });
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
      options.push({
        value: "header-task-repeat",
        label: "Repeat Tasks",
        isHeader: true,
      });
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

    const initialTaskId =
      initialItem && initialItem.type === "TASK"
        ? initialItem.taskId || initialItem.task?.taskId
        : undefined;

    if (initialTaskId) {
      const exists = options.some((o) => o.value === initialTaskId);
      if (!exists) {
        const normalHeaderIndex = options.findIndex(
          (o) => o.value === "header-task-normal",
        );
        const newItem = {
          value: initialTaskId,
          label:
            initialItem?.task?.taskName || initialItem?.title || "Selected Task",
        };
        if (normalHeaderIndex !== -1) {
          options.splice(normalHeaderIndex + 1, 0, newItem);
        } else {
          options.unshift(
            {
              value: "header-task-normal",
              label: "Normal Tasks",
              isHeader: true,
            },
            newItem,
          );
        }
      }
    }

    return options;
  }, [taskSearchData, initialItem, search, selectedRefId, type, title]);

  const meetingOptions = useMemo<DropdownOptionItem[]>(() => {
    if (!search.trim()) {
      if (selectedRefId && type === "MEETING") {
        return [{ value: selectedRefId, label: title }];
      }
      return [];
    }
    const rawData = meetingSearchData?.data;
    if (!rawData) return [];

    const isGrouped =
      rawData && typeof rawData === "object" && "normal" in rawData;
    const normal = isGrouped
      ? (rawData as DetailedMeetingSearchGroup).normal
      : [];
    const detail = isGrouped
      ? (rawData as DetailedMeetingSearchGroup).detail
      : [];

    const options: DropdownOptionItem[] = [];

    if (normal.length > 0) {
      options.push({
        value: "header-normal",
        label: "Normal Meetings",
        isHeader: true,
      });
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
      options.push({
        value: "header-detail",
        label: "Detail Meetings",
        isHeader: true,
      });
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

    const initialMeetingId =
      initialItem && initialItem.type === "MEETING"
        ? initialItem.meetingId || initialItem.meeting?.meetingId
        : undefined;

    if (initialMeetingId) {
      const exists = options.some((o) => o.value === initialMeetingId);
      if (!exists) {
        const normalHeaderIndex = options.findIndex(
          (o) => o.value === "header-normal",
        );
        const newItem = {
          value: initialMeetingId,
          label:
            initialItem?.meeting?.meetingName ||
            initialItem?.title ||
            "Selected Meeting",
        };
        if (normalHeaderIndex !== -1) {
          options.splice(normalHeaderIndex + 1, 0, newItem);
        } else {
          options.unshift(
            {
              value: "header-normal",
              label: "Normal Meetings",
              isHeader: true,
            },
            newItem,
          );
        }
      }
    }

    return options;
  }, [meetingSearchData, initialItem, search, selectedRefId, type, title]);

  const refOptions: DropdownOptionItem[] =
    type === "TASK" ? taskOptions : meetingOptions;

  const typeOptions = [
    { label: "Task", value: "TASK" },
    { label: "Meeting", value: "MEETING" },
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
      setSelectedRefId(
        initialItem.taskId ||
          initialItem.task?.taskId ||
          initialItem.meetingId ||
          initialItem.meeting?.meetingId ||
          "",
      );

      const totalMins = initialItem.estimatedTime || 0;
      const hrs = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      setEstimatedHours(hrs > 0 ? String(hrs) : "");
      setEstimatedMinutes(mins > 0 ? String(mins) : "");

      setRemarks(initialItem.remarks || "");
    } else {
      setType("TASK");
      setTitle("");
      setSearch("");
      setSelectedRefId("");
      setEstimatedHours("");
      setEstimatedMinutes("");
      setRemarks("");
    }
    setErrors({});
  }, [initialItem, open]);

  const validate = () => {
    const newErrors: {
      title?: string;
      estimatedTime?: string;
    } = {};

    if (!selectedRefId) {
      newErrors.title = `Please select a ${type === "TASK" ? "task" : "meeting"}`;
    }

    const totalMinutes =
      (Number(estimatedHours) || 0) * 60 + (Number(estimatedMinutes) || 0);
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
      refOptions.find(
        (o) => !o.isHeader && !o.isFooterNote && o.value === selectedRefId,
      )?.label ||
      "";

    const totalMinutes =
      (Number(estimatedHours) || 0) * 60 + (Number(estimatedMinutes) || 0);

    if (initialItem?.planItemId) {
      updateItem(
        {
          planItemId: initialItem.planItemId,
          type,
          title: finalTitle,
          estimatedTime: totalMinutes,
          priority: initialItem?.priority || "Medium",
          remarks: remarks.trim() || undefined,
          taskId: type === "TASK" ? selectedRefId || undefined : undefined,
          meetingId:
            type === "MEETING" ? selectedRefId || undefined : undefined,
        },
        {
          onSuccess: () => {
            handleModalClose();
          },
        },
      );
    } else {
      addItem(
        {
          employeeId,
          date: todayDate,
          type,
          title: finalTitle,
          priority: "Medium",
          estimatedTime: totalMinutes,
          remarks: remarks.trim() || undefined,
          taskId: type === "TASK" ? selectedRefId || undefined : undefined,
          meetingId:
            type === "MEETING" ? selectedRefId || undefined : undefined,
        },
        {
          onSuccess: () => {
            handleModalClose();
          },
        },
      );
    }
  };

  const handleDirectSubmitPlanningItem = async (payload: {
    taskId?: string;
    meetingId?: string;
    estimatedTime: number;
    remarks: string;
    title: string;
  }) => {
    return new Promise<void>((resolve, reject) => {
      addItem(
        {
          employeeId,
          date: todayDate,
          type: payload.taskId ? "TASK" : "MEETING",
          title: payload.title,
          priority: "Medium",
          estimatedTime: payload.estimatedTime,
          remarks: payload.remarks || undefined,
          taskId: payload.taskId,
          meetingId: payload.meetingId,
        },
        {
          onSuccess: () => {
            handleModalClose();
            resolve();
          },
          onError: (err) => {
            reject(err);
          },
        }
      );
    });
  };

  return {
    type,
    setType,
    setTitle,
    search,
    setSearch,
    selectedRefId,
    setSelectedRefId,
    estimatedHours,
    setEstimatedHours,
    estimatedMinutes,
    setEstimatedMinutes,
    remarks,
    setRemarks,
    errors,
    setErrors,
    refOptions,
    typeOptions,
    handleSubmit,
    handleModalClose,
    handleDirectSubmitPlanningItem,
    isPending,
    isInputOvertime,
  };
}
