import React, { Suspense, useCallback, useEffect, useState } from "react";

import {
  ArrowUp,
  BarChart2,
  Bell,
  Calendar,
  CheckSquare,
  Clock,
  CornerDownLeft,
  Copy,
  Crown,
  FileText,
  Layers,
  LayoutList,
  List,
  Plus,
  Target,
  User,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import MeetingTimer from "../meetingTimer";
import { cn } from "@/lib/utils";
import { useAgenda } from "./useAgenda";

import { SpinnerIcon } from "@/components/shared/Icons";
import { formatDate, getInitials } from "@/features/utils/app.utils";
import { adjustColorForText } from "@/features/utils/color.utils";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FormCheckbox from "@/components/shared/Form/FormCheckbox/FormCheckbox";
import { ImageBaseURL } from "@/features/utils/urls.utils";
import IssueAgendaAddModal from "./issueAgendaAddModal";
import ModalData from "@/components/shared/Modal/ModalData/ModalData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  closestCenter,
  CollisionDetection,
  DndContext,
  Modifier,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import AgendaList from "./agendaList";

const Tasks = React.lazy(() => import("../Tasks"));
const Projects = React.lazy(() => import("../Projects"));
const KPITable = React.lazy(() => import("../KpiTable"));

function IssueModal({
  open,
  onClose,
  issue,
  defaultType = "",
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  issue: string;
  defaultType?: string;
  onSubmit?: (data: { type: string; value: string }) => void;
}) {
  const [selectedType, setSelectedType] = useState(defaultType);
  useEffect(() => {
    if (open) {
      setSelectedType(defaultType || "");
    }
  }, [open, defaultType]);
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "var(--vw, 100vw)",
        height: "var(--vh, 100vh)",
        background: "rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div className="bg-white w-96 p-5 rounded-md shadow-2xl border-2 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
        <p>Value: {issue}</p>
        <div className="my-3">
          <RadioGroup value={selectedType} onValueChange={setSelectedType}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ISSUE" id="r1" />
              <label htmlFor="r1">Issue</label>
              <RadioGroupItem value="OBJECTIVE" id="r2" className="ml-6" />
              <label htmlFor="r2">Objective</label>
            </div>
          </RadioGroup>
        </div>
        <Button
          onClick={() => {
            if (selectedType && onSubmit) {
              onSubmit({ type: selectedType, value: issue });
            }
          }}
          disabled={!selectedType}
        >
          Submit
        </Button>
        {/* <Button onClick={onClose} style={{ marginLeft: 8 }}>
          Close
        </Button> */}
      </div>
    </div>
  );
}

function MaxAgendaModal({
  open,
  onClose,
  onStartAnyway,
  perAgendaTime,
  meetingTime,
  priorityCount,
  hasPriorityAgenda,
}: {
  open: boolean;
  onClose: () => void;
  onStartAnyway: () => void;
  perAgendaTime?: number;
  meetingTime?: string;
  priorityCount?: number;
  hasPriorityAgenda?: boolean;
}) {
  const meetingTimeMinutes = Math.floor(Number(meetingTime || 0) / 60);
  const durationPerAgenda = hasPriorityAgenda && perAgendaTime && perAgendaTime > 0
    ? perAgendaTime
    : Number(import.meta.env.VITE_DETAILMEETINGAGENDADURATION || 5);

  const isPriorityWarning = hasPriorityAgenda && perAgendaTime && perAgendaTime > 0;

  const modalButtons = [
    {
      btnText: "Cancel",
      btnClick: onClose,
      buttonCss: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 h-10 px-5 rounded-lg font-semibold",
    },
    {
      btnText: "Start AnyWay",
      btnClick: onStartAnyway,
      buttonCss: "bg-red-600 hover:bg-red-700 text-white border-red-600 h-10 px-5 rounded-lg font-semibold hover:text-white",
    },
  ];

  return (
    <ModalData
      isModalOpen={open}
      modalClose={onClose}
      modalTitle="Max Agenda Reached"
      containerClass="max-w-md w-full min-h-0"
      buttons={modalButtons}
    >
      <p className="text-gray-700 text-md  text-center py-2">
        {isPriorityWarning ? (
          <>
            Average time per agenda is <strong className="text-gray-900">{durationPerAgenda} min</strong> for <strong className="text-gray-900">{priorityCount} agendas</strong>. The meeting duration (<strong className="text-gray-900">{meetingTimeMinutes} min</strong>) is insufficient. Please reduce priority agendas.
          </>
        ) : (
          "You have added max agenda in this meeting. First move this to resolved or parked."
        )}
      </p>
    </ModalData>
  );
}

interface ExtendedDetails {
  status?: string;
  deadline?: string;
  unit?: string;
  kpiType?: string;
  frequency?: string;
  ownerName?: string;
}

interface SummaryData {
  meetingName?: string;
  date?: string;
  summary: {
    added: SummaryAddedItem[];
    updated: SummaryUpdatedItem[];
    removed: SummaryRemovedItem[];
  };
}

interface AgendaProps {
  meetingName: string;
  meetingId: string;
  meetingStatus?: string;
  meetingResponse?: MeetingResFire | null;
  joiners: Joiners[];
  meetingTime?: string;
  perAgendaTime?: number;
  isTeamLeader: boolean | undefined;
  isSuperAdmin: boolean;
  follow?: boolean;
  isBellRing?: () => void;
  stopRecording?: () => void;
}

export default function Agenda({
  meetingName,
  meetingId,
  meetingStatus,
  meetingResponse,
  meetingTime,
  perAgendaTime,
  isTeamLeader,
  isSuperAdmin,
  follow,
  joiners,
  isBellRing,
  stopRecording,
}: AgendaProps) {
  const {
    issueInput,
    editing,
    modalOpen,
    noAgendaModalOpen,
    modalIssue,
    dropdownVisible,
    agendaList,
    isSelectedAgenda,
    isSideBar,
    filteredIssues,
    searchOptions,
    setIssueInput,
    setEditingValue,
    setModalOpen,
    setNoAgendaModalOpen,
    setDropdownVisible,
    handleAddIssue,
    startEdit,
    cancelEdit,
    updateEdit,
    handleDelete,
    handleUpdateSelectedObjective,
    handleModalSubmit,
    handleTimeUpdate,
    handleConclusionMeeting,
    handleDesc,
    activeTab,
    handleTabChange,
    handleListClick,
    detailAgendaData,
    kpisFireBase,
    projectsFireBase,
    tasksFireBase,
    isPending,
    startMeetingLoading,
    startDiscussionLoading,
    goToConclusionLoading,
    handleStartMeeting,
    handleTogglePriority,
    handleCloseMeetingWithLog,
    endMeetingLoading,
    conclusionLoading,
    hasChanges,
    selectedItem,
    handleCheckIn,
    handleAddAgendaModal,
    addIssueModal,
    setAddIssueModal,
    isUpdatingTime,
    conclusionTime,
    handleAgendaTabFilter,
    ioType,
    setSelectedIoType,
    handleMarkAsSolved,
    handleMarkAsPark,
    resolutionFilter,
    handleDragEnd,
    unFollowByUser,
    createIssueLoading,
    layoutMode,
    handleLayoutModeChange,
    meetingSummary,
  } = useAgenda({
    meetingId,
    meetingStatus,
    meetingResponse,
    canEdit: true,
    joiners,
    isTeamLeader,
    isSuperAdmin,
    follow,
    stopRecording,
  });

  const summaryData = meetingSummary?.data as SummaryData | undefined;
  const summary = summaryData?.summary;
  const hasSummary = !!(
    summary &&
    ((summary.added && summary.added.length > 0) ||
      (summary.removed && summary.removed.length > 0) ||
      (summary.updated && summary.updated.length > 0))
  );

  const formatSummaryDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch  {
      return dateStr.split("T")[0];
    }
  };

  const formatSummaryDateTime = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const datePart = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const timePart = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return `${datePart}, ${timePart.toLowerCase()}`;
    } catch {
      return dateStr;
    }
  };

  const getDetailsText = (item: SummaryAddedItem) => {
    const parts: string[] = [];
    const details = item.details as ExtendedDetails | undefined;
    if (details?.status) {
      parts.push(`Status: ${details.status}`);
    }
    if (details?.deadline) {
      parts.push(`Deadline: ${formatSummaryDate(details.deadline)}`);
    }
    if (details?.unit) {
      parts.push(`Unit: ${details.unit}`);
    }
    if (details?.kpiType) {
      parts.push(`KPI Type: ${details.kpiType}`);
    }
    if (details?.frequency) {
      parts.push(`Frequency: ${details.frequency}`);
    }
    if (details?.ownerName) {
      parts.push(`Owner: ${details.ownerName}`);
    }
    return parts.length > 0 ? ` (${parts.join(", ")})` : "";
  };

  const getUpdateSentence = (item: SummaryUpdatedItem) => {
    const category = getCategory(item.type);
    const typeLabel = category === "agenda" ? "objective" : category === "kpi" ? "KPI" : category || "item";
    const capitalizedType = typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1);

    if (!item.diff || item.diff.length === 0) {
      return `${capitalizedType} "${item.name}" was updated.`;
    }

    const diffSentences = item.diff.map((df) => {
      const fieldName = df.field === "deadline" ? "deadline" : df.field;
      const oldVal = df.field === "deadline" ? formatSummaryDate(df.oldValue) : df.oldValue;
      const newVal = df.field === "deadline" ? formatSummaryDate(df.newValue) : df.newValue;
      
      return `${fieldName} was changed from "${oldVal || 'None'}" to "${newVal}"`;
    });

    const sentence = diffSentences.join(" and ");
    return `${capitalizedType} "${item.name}" ${sentence}.`;
  };

  const getRemovedText = (item: SummaryRemovedItem) => {
    const type = getCategory(item.type);
    if (type === "agenda") return `Objective "${item.name}" was unlinked.`;
    if (type === "task") return `Task "${item.name}" was unlinked.`;
    if (type === "project") return `Project "${item.name}" was unlinked.`;
    if (type === "kpi") return `KPI "${item.name}" was unlinked.`;
    return `"${item.name}" was unlinked.`;
  };




  const renderDetailsElement = (item: SummaryAddedItem) => {
    const details = item.details as ExtendedDetails | undefined;
    if (!details) return null;

    const elements: React.ReactNode[] = [];
    if (details.status) {
      elements.push(
        <span key="status">
          Status: {details.status}
        </span>
      );
    }
    if (details.deadline) {
      elements.push(
        <span key="deadline">
          <strong>Deadline: {formatSummaryDate(details.deadline)}</strong>
        </span>
      );
    }
    if (details.unit) {
      elements.push(<span key="unit">Unit: {details.unit}</span>);
    }
    if (details.kpiType) {
      elements.push(<span key="kpiType">KPI Type: {details.kpiType}</span>);
    }
    if (details.frequency) {
      elements.push(<span key="frequency">Frequency: {details.frequency}</span>);
    }
    if (details.ownerName) {
      elements.push(<span key="owner">Owner: {details.ownerName}</span>);
    }

    if (elements.length === 0) return null;

    return (
      <>
        {" ("}
        {elements.map((el, index) => (
          <React.Fragment key={index}>
            {index > 0 && ", "}
            {el}
          </React.Fragment>
        ))}
        {")"}
      </>
    );
  };

  const renderAddedElement = (item: SummaryAddedItem) => {
    const nameElement = <strong>{item.name}</strong>;
    return (
      <span>
        {nameElement}
        {renderDetailsElement(item)}
      </span>
    );
  };

  const renderUpdateElement = (item: SummaryUpdatedItem) => {
    const category = getCategory(item.type);
    const typeLabel = category === "agenda" ? "objective" : category === "kpi" ? "KPI" : category || "item";
    const capitalizedType = typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1);

    const nameElement = <strong>{item.name}</strong>;

    if (!item.diff || item.diff.length === 0) {
      return (
        <span>
          {capitalizedType} {nameElement} was updated.
        </span>
      );
    }

    const diffElements = item.diff.map((df, index) => {
      const fieldName = df.field === "deadline" ? "deadline" : df.field;
      const oldVal = df.field === "deadline" ? formatSummaryDate(df.oldValue) : df.oldValue;
      const newVal = df.field === "deadline" ? formatSummaryDate(df.newValue) : df.newValue;

      const isDeadline = df.field === "deadline";
      const isStatus = df.field === "status";

      if (isDeadline) {
        return (
          <span key={index}>
            <strong>{fieldName}</strong> was changed from <strong>{oldVal || "None"}</strong> to <strong>{newVal}</strong>
          </span>
        );
      }

      if (isStatus) {
        const oldColor = adjustColorForText(df.oldColor) || undefined;
        const newColor = adjustColorForText(df.newColor) || undefined;
        return (
          <span key={index}>
            {fieldName} was changed from{" "}
            <span style={oldColor ? { color: oldColor, fontWeight: "600" } : undefined}>
              {oldVal || "None"}
            </span>{" "}
            to{" "}
            <span style={newColor ? { color: newColor, fontWeight: "600" } : undefined}>
              {newVal}
            </span>
          </span>
        );
      }

      return (
        <span key={index}>
          {fieldName} was changed from {oldVal || "None"} to {newVal}
        </span>
      );
    });

    const joinedDiffs: React.ReactNode[] = [];
    diffElements.forEach((el, index) => {
      if (index > 0) {
        joinedDiffs.push(" and ");
      }
      joinedDiffs.push(el);
    });

    return (
      <span>
        {capitalizedType} {nameElement} {joinedDiffs}.
      </span>
    );
  };

  const renderRemovedElement = (item: SummaryRemovedItem) => {
    const type = getCategory(item.type);
    const nameElement = <strong>{item.name}</strong>;

    if (type === "agenda") {
      return <span>Objective {nameElement} was unlinked.</span>;
    }
    if (type === "task") {
      return <span>Task {nameElement} was unlinked.</span>;
    }
    if (type === "project") {
      return <span>Project {nameElement} was unlinked.</span>;
    }
    if (type === "kpi") {
      return <span>KPI {nameElement} was unlinked.</span>;
    }
    return <span>{nameElement} was unlinked.</span>;
  };


  const getCategory = (type?: string): "agenda" | "kpi" | "task" | "project" | null => {
    if (!type) return null;
    const upperType = type.toUpperCase();
    if (upperType === "ISSUE" || upperType === "OBJECTIVE" || upperType === "AGENDA") return "agenda";
    if (upperType === "KPI") return "kpi";
    if (upperType === "TASK") return "task";
    if (upperType === "PROJECT") return "project";
    return null;
  };

  const categoryChanges = {
    agenda: {
      added: summary?.added?.filter((item: SummaryAddedItem) => getCategory(item.type) === "agenda") || [],
      updated: summary?.updated?.filter((item: SummaryUpdatedItem) => getCategory(item.type) === "agenda") || [],
      removed: summary?.removed?.filter((item: SummaryRemovedItem) => getCategory(item.type) === "agenda") || [],
    },
    kpi: {
      added: summary?.added?.filter((item: SummaryAddedItem) => getCategory(item.type) === "kpi") || [],
      updated: summary?.updated?.filter((item: SummaryUpdatedItem) => getCategory(item.type) === "kpi") || [],
      removed: summary?.removed?.filter((item: SummaryRemovedItem) => getCategory(item.type) === "kpi") || [],
    },
    task: {
      added: summary?.added?.filter((item: SummaryAddedItem) => getCategory(item.type) === "task") || [],
      updated: summary?.updated?.filter((item: SummaryUpdatedItem) => getCategory(item.type) === "task") || [],
      removed: summary?.removed?.filter((item: SummaryRemovedItem) => getCategory(item.type) === "task") || [],
    },
    project: {
      added: summary?.added?.filter((item: SummaryAddedItem) => getCategory(item.type) === "project") || [],
      updated: summary?.updated?.filter((item: SummaryUpdatedItem) => getCategory(item.type) === "project") || [],
      removed: summary?.removed?.filter((item: SummaryRemovedItem) => getCategory(item.type) === "project") || [],
    },
  };






  const unresolvedCount = agendaList?.filter(
    (item) => item.type === "UNRESOLVED",
  ).length;

  const hasPriorityAgenda = agendaList?.some(
    (item) => item.isPriority === true && item.type === "UNRESOLVED"
  );

  const resolvedCount = agendaList?.filter(
    (item) => item.type === "RESOLVED",
  ).length;

  const parkedCount = agendaList?.filter(
    (item) => item.type === "PARKED",
  ).length;

  const [showMaxAgendaModal, setShowMaxAgendaModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const [startAnywayFlow, setStartAnywayFlow] = useState<"meeting" | "discussion" | null>(null);
  const [isSetPriorityMode, setIsSetPriorityMode] = useState(false);

  const customCollisionDetection = useCallback<CollisionDetection>(
    (args) => {
      const activeId = String(args.active.id);
      const activeItem = agendaList?.find((item) => item?.issueObjectiveId === activeId);
      if (!activeItem) return [];

      const isActivePriority = activeItem.isPriority === true;

      // Filter droppable containers to only allow matching priority items
      const validContainers = args.droppableContainers.filter((container) => {
        const item = agendaList?.find(
          (i) => i?.issueObjectiveId === String(container.id)
        );
        if (!item) return false;
        return (item.isPriority === true) === isActivePriority;
      });

      return closestCenter({
        ...args,
        droppableContainers: validContainers,
      });
    },
    [agendaList]
  );

  const restrictPriorityDrag = useCallback<Modifier>(
    ({ transform, active, activeNodeRect }) => {
      if (!active || !activeNodeRect || !agendaList) return transform;

      const activeItem = agendaList.find((item) => item?.issueObjectiveId === active.id);
      if (!activeItem) return transform;

      const isActivePriority = activeItem.isPriority === true;

      // Query all rendered list items
      const items = Array.from(
        document.querySelectorAll("li[data-priority]")
      ) as HTMLLIElement[];
      
      const groupItems = items.filter(
        (el) => (el.getAttribute("data-priority") === "true") === isActivePriority
      );
      if (groupItems.length === 0) return transform;

      // Get bounding boxes in window coordinates
      const rects = groupItems.map((el) => el.getBoundingClientRect());
      
      // Calculate screen boundaries
      const allowedTop = Math.min(...rects.map((r) => r.top));
      const allowedBottom = Math.max(...rects.map((r) => r.bottom));

      // Calculate restricted displacement (y)
      const minY = allowedTop - activeNodeRect.top;
      const maxY = allowedBottom - activeNodeRect.top - activeNodeRect.height;

      return {
        ...transform,
        x: 0,
        y: Math.max(minY, Math.min(maxY, transform.y)),
      };
    },
    [agendaList]
  );

  const defaultAgendaOrder = ["tasks", "kpis", "projects"];
  const configuredAgendaOrder = (
    import.meta.env.VITE_AGENDA_SECTION_ORDER || ""
  )
    .split(",")
    .map((key: string) => key.trim().toLowerCase())
    .filter((key: string) => ["tasks", "kpis", "projects"].includes(key));

  const sectionOrder = configuredAgendaOrder.length
    ? configuredAgendaOrder
    : defaultAgendaOrder;

  const tabConfigs: Record<
    string,
    {
      key: "kpis" | "projects" | "tasks";
      label: string;
      count: number | undefined;
      icon: React.ReactNode;
    }
  > = {
    kpis: {
      key: "kpis",
      label: "KPIs",
      count: detailAgendaData?.noOfKPIs,
      icon: <BarChart2 className="h-5 w-5" />,
    },
    projects: {
      key: "projects",
      label: "Projects",
      count: detailAgendaData?.noOfProjects,
      icon: <CheckSquare className="h-5 w-5" />,
    },
    tasks: {
      key: "tasks",
      label: "Tasks",
      count: detailAgendaData?.noOfTasks,
      icon: <List className="h-5 w-5" />,
    },
  };

  useEffect(() => {
    if (sectionOrder.length > 0 && !sectionOrder.includes(activeTab)) {
      handleTabChange(sectionOrder[0] as "kpis" | "projects" | "tasks");
    }
  }, [sectionOrder, activeTab, handleTabChange]);

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const checkMaxAgendaReached = () => {
    const totalMinutes = Math.floor(Number(meetingTime || 0) / 60);

    let countToCompare = unresolvedCount || 0;
    let durationPerAgenda = Number(
      import.meta.env.VITE_DETAILMEETINGAGENDADURATION || 5
    );

    if (hasPriorityAgenda) {
      // 1. Only count unresolved priority agendas
      countToCompare = agendaList?.filter(
        (item) => item.isPriority === true && item.type === "UNRESOLVED"
      ).length || 0;

      // 2. Use perAgendaTime if present, otherwise fallback to VITE_DETAILMEETINGAGENDADURATION
      if (perAgendaTime && perAgendaTime > 0) {
        durationPerAgenda = perAgendaTime;
      }
    }

    const maxAgenda = Math.floor(totalMinutes / durationPerAgenda);
    return countToCompare > maxAgenda;
  };

  const handleStartMeetingClick = () => {
    if (checkMaxAgendaReached()) {
      setStartAnywayFlow("meeting");
      setShowMaxAgendaModal(true);
    } else {
      setConfirmModal({
        open: true,
        title: "Start Meeting",
        description: "Are you sure you want to start the meeting?",
        onConfirm: () => {
          handleStartMeeting();
          setConfirmModal((prev) => ({ ...prev, open: false }));
        },
      });
    }
  };

  const handleStartDiscussionClick = () => {
    if (!agendaList || agendaList.length === 0) {
      setNoAgendaModalOpen(true);
      return;
    }
    if (checkMaxAgendaReached()) {
      setStartAnywayFlow("discussion");
      setShowMaxAgendaModal(true);
    } else {
      setConfirmModal({
        open: true,
        title: "Start Discussion",
        description: "Are you sure you want to start the discussion?",
        onConfirm: () => {
          handleDesc();
          setConfirmModal((prev) => ({ ...prev, open: false }));
        },
      });
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  // const formatAgendaTime = (totalSeconds: number) => {
  //   if (!totalSeconds || isNaN(totalSeconds)) {
  //     return "00:00";
  //   }

  //   const minutes = Math.floor(totalSeconds / 60);
  //   const seconds = Math.floor(totalSeconds % 60);

  //   return `${minutes.toString().padStart(2, "0")}:${seconds
  //     .toString()
  //     .padStart(2, "0")}`;
  // };

  function formatTime(seconds: number): string {
    const totalSeconds = Math.round(Number(seconds)); // round first
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      // Show HH:MM:SS if more than 1 hour
      return `${hours.toString().padStart(2, "0")}h : ${minutes
        .toString()
        .padStart(2, "0")}m : ${secs.toString().padStart(2, "0")}s`;
    }

    // Otherwise show MM:SS
    return `${minutes.toString().padStart(2, "0")}m : ${secs
      .toString()
      .padStart(2, "0")}s`;
  }

  const formatLocalDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  function formatSecondsToHHMM(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}h : ${minutes.toString().padStart(2, "0")}m`;
  }

  const meetingStatusLabels = {
    NOT_STARTED: "Not Started",
    STARTED: "Started",
    DISCUSSION: "Discussion",
    CONCLUSION: "Conclusion",
    ENDED: "Ended",
  };

  const tips: TipItem[] = [
    {
      icon: <Target className="w-8 h-8 text-blue-500" />,
      title: "DEFINE PURPOSE AND KEY POINTS",
      description: "Summarize the goal, list discussion points",
    },
    {
      icon: <Calendar className="w-8 h-8 text-blue-500" />,
      title: "BREAK DOWN AGENDA INTO TIME-BOXED TOPICS",
      description: "Use focused, time boxed topics",
    },
    {
      icon: <ArrowUp className="w-8 h-8 text-blue-500" />,
      title: "PRIORITIZE HIGH IMPACT ITEMS",
      description: "Address them first",
    },
    {
      icon: <User className="w-8 h-8 text-blue-500" />,
      title: "ASSIGN TOPIC OWNERS AND TIME ESTIMATES",
      description: "Add leaders and time estimates",
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-500" />,
      title: "KEEP MEETING ON TRACK AND LEAVE ROOM FOR QUESTIONS",
      description: "Stick to the agenda, allocate time questions",
    },
    {
      icon: <FileText className="w-8 h-8 text-blue-500" />,
      title: "ALLOCATE TIME FOR CONCLUSION AND WRAP UP",
      description: "Allow a few minutes at the at Conclusion and Wrap Up",
    },
  ];

  return (
    <div>
      {/* radio button modal */}
      <IssueModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        issue={modalIssue}
        defaultType=""
        onSubmit={handleModalSubmit}
      />
      <MaxAgendaModal
        open={showMaxAgendaModal}
        onClose={() => setShowMaxAgendaModal(false)}
        perAgendaTime={perAgendaTime}
        meetingTime={meetingTime}
        priorityCount={
          hasPriorityAgenda
            ? (agendaList?.filter(
                (item) => item.isPriority === true && item.type === "UNRESOLVED"
              ).length || 0)
            : unresolvedCount
        }
        hasPriorityAgenda={hasPriorityAgenda}
        onStartAnyway={() => {
          setShowMaxAgendaModal(false);
          if (startAnywayFlow === "discussion") {
            handleDesc();
          } else {
            handleStartMeeting();
          }
        }}
      />
      <Dialog open={noAgendaModalOpen} onOpenChange={setNoAgendaModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agenda Required</DialogTitle>
            <DialogDescription>
              Please add an issue objective before starting discussion.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setNoAgendaModalOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ModalData
        isModalOpen={confirmModal.open}
        modalClose={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
        modalTitle={confirmModal.title}
        containerClass="min-h-fit"
        buttons={[
          {
            btnText: "Cancel",
            btnClick: () =>
              setConfirmModal((prev) => ({ ...prev, open: false })),
            buttonCss:
              "bg-transparent text-gray-700 hover:bg-gray-100 border border-gray-300",
          },
          {
            btnText: "Confirm",
            btnClick: () => {
              confirmModal.onConfirm();
            },
          },
        ]}
      >
        <p className="text-gray-700 text-sm sm:text-base py-2">
          {confirmModal.description}
        </p>
      </ModalData>
      <IssueAgendaAddModal
        isModalOpen={addIssueModal}
        modalClose={() => setAddIssueModal(false)}
        onSubmit={handleModalSubmit}
        isLoading={createIssueLoading}
        issueInput={issueInput}
        setIssueInput={setIssueInput}
        setDropdownVisible={setDropdownVisible}
        dropdownVisible={dropdownVisible}
        filteredIssues={filteredIssues}
        searchOptions={searchOptions}
        handleUpdateSelectedObjective={handleUpdateSelectedObjective}
        setSelectedIoType={setSelectedIoType}
      />
      {meetingStatus !== "DISCUSSION" &&
        meetingStatus !== "ENDED" &&
        meetingStatus !== "CONCLUSION" && (
          <div className="flex justify-between">
            {meetingStatus === "STARTED" || meetingStatus === "NOT_STARTED" ? (
              <div className="w-full flex h-[40px] border border-gray-300 rounded-[10px] items-center px-4 mr-4">
                <div className="flex-1 text-lg  w-[30%] text-primary ml-3 font-semibold truncate">
                  {meetingName}
                </div>

                <div className="hidden md:block w-[50%] text-gray-500  text-lg truncate ml-4">
                  Meeting Agenda
                </div>
              </div>
            ) : (
              <div className="flex gap-4 items-center">
                <div className="hidden md:block w-[370px] min-w-[370px] text-gray-500  text-lg truncate">
                  Meeting Agenda
                </div>
                <div className="">
                  <div className="flex gap-4 items-center break-all mb-2 flex-wrap">
                    <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-sm">Agenda :</span>
                      <span className="font-bold">
                        {formatTime(Number(conclusionTime?.agendaActual))}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-sm">Discussion:</span>
                      <span className="font-bold">
                        {formatTime(
                          Number(conclusionTime?.discussionTotalActual),
                        )}
                      </span>
                    </div>

                    {conclusionTime?.conclusionActual != null && (
                      <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-sm">Conclusion:</span>
                        <span className="font-bold">
                          {formatTime(Number(conclusionTime.conclusionActual))}
                        </span>
                      </div>
                    )}

                    {conclusionTime?.meetingPlanned != null && (
                      <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-sm">
                          Meeting Planned:
                        </span>
                        <span className="font-bold">
                          {formatSecondsToHHMM(
                            Number(conclusionTime.meetingPlanned),
                          )}
                        </span>
                      </div>
                    )}

                    {conclusionTime?.meetingActual != null &&
                      conclusionTime?.meetingActual != "0" && (
                        <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-sm">
                            Meeting Actual:
                          </span>
                          <span className="font-bold">
                            {formatSecondsToHHMM(
                              Number(conclusionTime.meetingActual),
                            )}
                          </span>
                        </div>
                      )}
                  </div>
                  <div className="flex gap-4 items-center flex-wrap">
                    <div className="flex items-center gap-2 border px-3 py-1 rounded-lg bg-primary text-white">
                      <span className="font-medium text-sm">Tasks:</span>
                      <span className="font-bold">
                        {conclusionTime?.noOfTasks}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 border px-3 py-1 rounded-lg bg-primary text-white">
                      <span className="font-medium text-sm">Projects:</span>
                      <span className="font-bold">
                        {conclusionTime?.noOfProjects}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 border px-3 py-1 rounded-lg bg-primary text-white">
                      <span className="font-medium text-sm">KPIs:</span>
                      <span className="font-bold">
                        {conclusionTime?.noOfKPIs}
                      </span>
                    </div>
                    {/* <div className="flex items-center gap-2 border px-3 py-1 rounded-lg bg-primary text-white">
                      <span className="font-medium text-sm">
                        Solved Agenda:
                      </span>
                      <span className="font-bold">
                        {conclusionTime?.noOfSolvedIOs}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 border px-3 py-1 rounded-lg bg-primary text-white">
                      <span className="font-medium text-sm">
                        Unsolved Agenda:
                      </span>
                      <span className="font-bold">
                        {conclusionTime?.noOfUnsolvedIOs}
                      </span>
                    </div> */}
                  </div>
                </div>
              </div>
            )}
            {meetingStatus !== "ENDED" && (
              <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:w-auto">
                {meetingStatus === "NOT_STARTED" &&
                  (isTeamLeader || isSuperAdmin) && (
                    <Button
                      variant="outline"
                      className="w-[200px] h-[40px] bg-primary hover:bg-primary hover:text-white text-white rounded-[10px] cursor-pointer text-lg font-semibold flex items-center justify-center gap-2"
                      onClick={handleStartMeetingClick}
                      isLoading={startMeetingLoading || isPending}
                    >
                      Start Meeting
                    </Button>
                  )}

                {meetingStatus === "NOT_STARTED" ||
                  (!(isTeamLeader || isSuperAdmin) && (
                    <Button
                      variant="outline"
                      className="w-[200px] h-[40px] cursor-not-allowed hover:bg-primary hover:text-white bg-primary text-white rounded-[10px] text-lg font-semibold"
                      // onClick={handleJoinMeeting}
                    >
                      {
                        meetingStatusLabels[
                          meetingStatus as keyof typeof meetingStatusLabels
                        ]
                      }
                    </Button>
                  ))}

                {(isTeamLeader || isSuperAdmin) && (
                  <>
                    {meetingStatus === "STARTED" && (
                      <Button
                        variant="outline"
                        className="w-[200px] h-[40px] bg-primary hover:bg-primary hover:text-white text-white rounded-[10px] cursor-pointer text-lg font-semibold"
                        onClick={handleStartDiscussionClick}
                        isLoading={startDiscussionLoading}
                      >
                        Start Discussion
                      </Button>
                    )}
                  </>
                )}

                {(meetingStatus === "STARTED" ||
                  meetingStatus === "NOT_STARTED") && (
                  <div className="w-fit pr-2 h-[40px] border-gray-300 rounded-[10px] flex items-center justify-center">
                    <MeetingTimer
                      meetingTime={Number(meetingTime)}
                      actualTime={0}
                      lastSwitchTimestamp={Number(
                        meetingResponse?.state.meetingTimestamp,
                      )}
                      meetingStart={meetingStatus !== "NOT_STARTED"}
                      className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary"
                      onTimeUpdate={handleTimeUpdate}
                      isEditMode={meetingStatus === "NOT_STARTED"}
                      meetingStatus={meetingStatus}
                      isUpdating={isUpdatingTime}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      <div className="flex gap-3">
        <div
          className={cn(
            isSideBar
              ? "w-[370px]  h-full min-w-[370px] ease-out duration-1000"
              : "w-[50%]",
          )}
        >
          {meetingStatus !== "ENDED" &&
            meetingStatus !== "NOT_STARTED" &&
            meetingStatus !== "STARTED" && (
              <div className="w-full flex mb-2 h-[40px] rounded-[10px] justify-start ">
                <div className="hidden md:block w-[50%] text-gray-500  text-lg truncate ml-4">
                  Meeting Agenda
                </div>
              </div>
            )}
          <div className="flex gap-2  relative">
            {(meetingStatus === "STARTED" ||
              meetingStatus === "NOT_STARTED") && (
              <div className="flex gap-2 mb-2 relative w-full">
                <Input
                  value={issueInput}
                  onChange={(e) => {
                    setIssueInput(e.target.value);
                    setDropdownVisible(true);
                  }}
                  placeholder="Add or Create Agenda (Issue or Objective)"
                  onFocus={() => setDropdownVisible(true)}
                  onBlur={() =>
                    setTimeout(() => setDropdownVisible(false), 150)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (issueInput.trim() !== "") {
                        handleAddIssue();
                      }
                    }
                  }}
                  className="w-full h-[45px] sm:h-[50px] border-0 border-b-2 border-gray-300 rounded-none pr-10 text-sm sm:text-base focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[0px] "
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <CornerDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
                {dropdownVisible && filteredIssues.length > 0 && (
                  <ul
                    style={{
                      position: "absolute",
                      top: "110%",
                      left: 0,
                      right: 0,
                      background: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: 6,
                      zIndex: 10,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      maxHeight: 180,
                      overflowY: "auto",
                      margin: 0,
                      padding: 0,
                      listStyle: "none",
                    }}
                  >
                    {searchOptions.map((item) => (
                      <li
                        key={item.id}
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                        onMouseDown={() => {
                          handleUpdateSelectedObjective(item);
                        }}
                      >
                        {item.name} ({item.ioType})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <div className="relative h-full">
            <div className="mb-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
              <Tabs
                defaultValue="UNRESOLVED"
                onValueChange={(value) => {
                  // if (follow) {
                  //   handleAgendaTabFilter(value as "SOLVED" | "UNSOLVED");
                  // } else
                  // if (
                  //   meetingStatus !== "NOT_STARTED" &&
                  //   meetingStatus !== "ENDED"
                  // ) {
                  // }
                  handleAgendaTabFilter(
                    value as "SOLVED" | "UNRESOLVED" | "PARKED",
                  );
                }}
                value={resolutionFilter}
                className="w-fit"
              >
                <TabsList className="grid w-86 grid-cols-3">
                  <TabsTrigger
                    value="UNRESOLVED"
                    className="group data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-1"
                  >
                    Unresolved
                    <span className="text-[10px] opacity-70 group-data-[state=active]:opacity-100 group-data-[state=active]:text-white">
                      ({unresolvedCount})
                    </span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="RESOLVED"
                    className=" group relative data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-1"
                  >
                    Resolved{" "}
                    <span className="text-[10px] opacity-70 group-data-[state=active]:opacity-100 group-data-[state=active]:text-white">
                      ({resolvedCount})
                    </span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="PARKED"
                    className=" group relative data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-1"
                  >
                    Parked{" "}
                    <span className="text-[10px] opacity-70 group-data-[state=active]:opacity-100 group-data-[state=active]:text-white">
                      ({parkedCount})
                    </span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="UNSOLVED" className="mt-0"></TabsContent>
                <TabsContent value="SOLVED" className="mt-0"></TabsContent>
                <TabsContent value="PARKED" className="mt-0"></TabsContent>
              </Tabs>

              {(meetingStatus === "NOT_STARTED" || meetingStatus === "STARTED") && agendaList && agendaList.length > 0 && (
                <div className="flex items-center gap-2 pr-2 shrink-0">
                  <span className="text-md font-semibold text-primary">Set Priority</span>
                  <Switch
                    checked={isSetPriorityMode}
                    onCheckedChange={setIsSetPriorityMode}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              )}
            </div>
            <div
              className={`mt-1 pr-1 w-full overflow-auto ${meetingStatus === "DISCUSSION" ? "h-[calc(var(--vh,100vh)-230px)]" : "h-[calc(var(--vh,100vh)-260px)]"}`}
            >
              {agendaList && agendaList.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={customCollisionDetection}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictPriorityDrag]}
                >
                  <SortableContext
                    items={agendaList
                      .slice()
                      .filter((data) => resolutionFilter === data.type)
                      .sort((a, b) => {
                        const seqA = a.sequence;
                        const seqB = b.sequence;
                        if (seqA === null || seqA === undefined) {
                          if (seqB === null || seqB === undefined) return 0;
                          return 1;
                        }
                        if (seqB === null || seqB === undefined) {
                          return -1;
                        }
                        return seqA - seqB;
                      })
                      .map((i) => i.issueObjectiveId)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {agendaList &&
                        [...agendaList]
                          .sort((a, b) => {
                            const seqA = a.sequence;
                            const seqB = b.sequence;
                            if (seqA === null || seqA === undefined) {
                              if (seqB === null || seqB === undefined) return 0;
                              return 1;
                            }
                            if (seqB === null || seqB === undefined) {
                              return -1;
                            }
                            return seqA - seqB;
                          })
                          .filter((data) => resolutionFilter === data.type)
                          .map((item, idx) => (
                            <AgendaList
                              key={item.issueObjectiveId}
                              item={item}
                              idx={idx}
                              meetingStatus={meetingStatus}
                              isSelectedAgenda={isSelectedAgenda}
                              follow={follow}
                              editing={editing}
                              setEditingValue={setEditingValue}
                              updateEdit={updateEdit}
                              cancelEdit={cancelEdit}
                              handleListClick={handleListClick}
                              handleMarkAsSolved={handleMarkAsSolved}
                              handleMarkAsPark={handleMarkAsPark}
                              startEdit={startEdit}
                              handleDelete={handleDelete}
                              meetingResponse={meetingResponse}
                              conclusionTime={conclusionTime}
                              isTeamLeader={isTeamLeader || isSuperAdmin}
                              isUnFollow={unFollowByUser}
                              meetingTime={meetingTime}
                              perAgendaTime={perAgendaTime}
                              hasPriorityAgenda={hasPriorityAgenda}
                              handleTogglePriority={handleTogglePriority}
                              isSetPriorityMode={isSetPriorityMode}
                            />
                          ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              ) : (
                <p className="text-gray-500 text-sm">No issues added</p>
              )}

              {meetingStatus === "DISCUSSION" && (
                <div
                  className="absolute bottom-10 -right-3 border rounded-full p-2 bg-white shadow-2xl shadow-primary border-primary"
                  onClick={handleAddAgendaModal}
                >
                  <Plus />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            {meetingStatus === "DISCUSSION" && layoutMode === "tab" && (
              <div className="w-full">
                <div className="flex gap-4">
                  <nav className="z-20 flex">
                    <div className="mr-5 flex gap-3 items-center rounded-2xl ">
                      {sectionOrder.map((key: string) => {
                        const config = tabConfigs[key];
                        if (!config) return null;
                        const isActive = activeTab === config.key;
                        return (
                          <Button
                            key={config.key}
                            className={`w-32 mx-auto border border-b-0 shadow-border rounded-b-none hover:bg-white cursor-pointer flex items-center ${
                              isActive
                                ? "bg-white h-[50px] shadow-none border-t-4 border-l border-r border-primary z-10"
                                : "bg-gray-100 h-12"
                            }`}
                            style={
                              isActive
                                ? { marginBottom: "-2px", color: "#2f318e" }
                                : { marginBottom: "1px", color: "gray" }
                            }
                            onClick={() => {
                              if (follow || unFollowByUser)
                                handleTabChange(config.key);
                            }}
                          >
                            {config.icon}
                            <span>
                              {config.label} ({config.count ?? 0})
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </nav>
                </div>
              </div>
            )}

            {(meetingStatus === "CONCLUSION" || meetingStatus === "ENDED") && (
              <div className="mb-2">
                <div className="flex gap-4 items-center break-all mb-2 flex-wrap">
                  <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-sm">Agenda :</span>
                    <span className="font-bold">
                      {formatTime(Number(conclusionTime?.agendaActual))}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-sm">Discussion:</span>
                    <span className="font-bold">
                      {formatTime(
                        Number(conclusionTime?.discussionTotalActual),
                      )}
                    </span>
                  </div>

                  {conclusionTime?.conclusionActual != null && (
                    <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-sm">Conclusion:</span>
                      <span className="font-bold">
                        {formatTime(Number(conclusionTime.conclusionActual))}
                      </span>
                    </div>
                  )}

                  {conclusionTime?.meetingPlanned != null && (
                    <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-sm">
                        Meeting Planned:
                      </span>
                      <span className="font-bold">
                        {formatSecondsToHHMM(
                          Number(conclusionTime.meetingPlanned),
                        )}
                      </span>
                    </div>
                  )}

                  {conclusionTime?.meetingActual != null &&
                    conclusionTime?.meetingActual != "0" && (
                      <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-sm">
                          Meeting Actual:
                        </span>
                        <span className="font-bold">
                          {formatSecondsToHHMM(
                            Number(conclusionTime.meetingActual),
                          )}
                        </span>
                      </div>
                    )}
                </div>
                <div className="flex gap-4 items-center flex-wrap">
                  <div className="flex items-center gap-2 border px-3 py-1 rounded-lg bg-primary text-white">
                    <span className="font-medium text-sm">Tasks:</span>
                    <span className="font-bold">
                      {conclusionTime?.noOfTasks}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 border px-3 py-1 rounded-lg bg-primary text-white">
                    <span className="font-medium text-sm">Projects:</span>
                    <span className="font-bold">
                      {conclusionTime?.noOfProjects}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 border px-3 py-1 rounded-lg bg-primary text-white">
                    <span className="font-medium text-sm">KPIs:</span>
                    <span className="font-bold">
                      {conclusionTime?.noOfKPIs}
                    </span>
                  </div>
                  {/* <div className="flex items-center gap-2 border px-3 py-1 rounded-lg bg-primary text-white">
                    <span className="font-medium text-sm">Solved Agenda:</span>
                    <span className="font-bold">
                      {conclusionTime?.noOfSolvedIOs}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 border px-3 py-1 rounded-lg bg-primary text-white">
                    <span className="font-medium text-sm">
                      Unsolved Agenda:
                    </span>
                    <span className="font-bold">
                      {conclusionTime?.noOfUnsolvedIOs}
                    </span>
                  </div> */}
                </div>
              </div>
            )}
            <div className="flex flex-wrap md:flex-nowrap mb-2 items-center gap-3 md:w-auto ml-auto">
              {meetingStatus === "DISCUSSION" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={layoutMode === "stacked"}
                        disabled={!(follow || unFollowByUser)}
                        onClick={() =>
                          handleLayoutModeChange(
                            layoutMode === "tab" ? "stacked" : "tab",
                          )
                        }
                        className={cn(
                          "relative inline-flex h-9 w-18 shrink-0 cursor-pointer items-center rounded-full bg-primary p-1 transition-colors duration-200 focus:outline-none select-none shadow-xs",
                          !(follow || unFollowByUser) && "opacity-50 cursor-not-allowed",
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none z-10 flex h-7 w-7 transform items-center justify-center rounded-full bg-white text-primary shadow-md transition-transform duration-200 ease-in-out",
                            layoutMode === "stacked"
                              ? "translate-x-9"
                              : "translate-x-0",
                          )}
                        >
                          {layoutMode === "tab" ? (
                            <Layers className="h-4 w-4 text-primary" />
                          ) : (
                            <LayoutList className="h-4 w-4 text-primary" />
                          )}
                        </span>
                        <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none text-white/70">
                          <Layers className="h-4 w-4" />
                          <LayoutList className="h-4 w-4" />
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {layoutMode === "stacked"
                        ? "Switch to Tab View"
                        : "Switch to List View"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {(isTeamLeader || isSuperAdmin) && (
                <>
                  {meetingStatus === "DISCUSSION" && (
                    <>
                      <Button
                        className={`w-20px ml-2 mt-1 bg-primary p-2  rounded-full text-white justify-start cursor-pointer flex items-center `}
                        onClick={isBellRing}
                      >
                        <Bell className="w-16 h-16" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-[180px] h-[40px] bg-primary hover:bg-primary hover:text-white text-white rounded-[10px] cursor-pointer text-lg font-semibold"
                        onClick={() => {
                          setConfirmModal({
                            open: true,
                            title: "Go To Conclusion",
                            description:
                              "Are you sure you want to go to the conclusion?",
                            onConfirm: () => {
                              handleConclusionMeeting();
                              setConfirmModal((prev) => ({
                                ...prev,
                                open: false,
                              }));
                            },
                          });
                        }}
                        isLoading={goToConclusionLoading}
                      >
                        Go To Conclusion
                      </Button>
                    </>
                  )}
                  {meetingStatus === "CONCLUSION" && (
                    <Button
                      variant="outline"
                      className="bg-primary text-white px-4 hover:bg-primary py-5 text-sm hover:text-white sm:text-base md:text-lg"
                      onClick={() => {
                        setConfirmModal({
                          open: true,
                          title: "End Meeting",
                          description:
                            "Are you sure you want to end the meeting?",
                          onConfirm: () => {
                            handleCloseMeetingWithLog();
                            setConfirmModal((prev) => ({
                              ...prev,
                              open: false,
                            }));
                          },
                        });
                      }}
                      isLoading={endMeetingLoading}
                    >
                      End Meeting
                    </Button>
                  )}
                </>
              )}

              {meetingStatus !== "ENDED" &&
                meetingStatus !== "NOT_STARTED" &&
                meetingStatus !== "STARTED" && (
                  <div className="w-fit pr-2 h-[40px] border-gray-300 rounded-[10px] flex items-center justify-center">
                    <MeetingTimer
                      meetingTime={Number(meetingTime)}
                      actualTime={0}
                      lastSwitchTimestamp={Number(
                        meetingResponse?.state.meetingTimestamp,
                      )}
                      meetingStart={meetingStatus !== "NOT_STARTED"}
                      className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary"
                      onTimeUpdate={handleTimeUpdate}
                      // isEditMode={
                      //   meetingStatus === "NOT_STARTED" && isTeamLeader
                      // }
                      meetingStatus={meetingStatus}
                      isUpdating={isUpdatingTime}
                    />
                  </div>
                )}
            </div>
          </div>
          <div
            className={cn(
              "flex justify-center w-full relative border-primary overflow-hidden",
              meetingStatus === "DISCUSSION" ||
                meetingStatus === "CONCLUSION" ||
                meetingStatus === "ENDED"
                ? layoutMode === "tab"
                  ? "h-[calc(var(--vh,100vh)-170px)] border rounded-tr-[10px] rounded-bl-[10px] rounded-br-[10px]"
                  : "h-[calc(var(--vh,100vh)-170px)] border rounded-[10px]"
                : "h-[calc(var(--vh,100vh)-140px)] p-4"
            )}
          >
            {meetingStatus === "NOT_STARTED" ? (
              hasSummary ? (
                (() => {
                  const sectionsList: {
                    title: string;
                    items: { text: string; element: React.ReactNode }[];
                  }[] = [];

                   if (categoryChanges.agenda.added.length > 0) {
                    sectionsList.push({
                      title: "Objectives Added",
                      items: categoryChanges.agenda.added.map((item: SummaryAddedItem) => ({
                        text: `${item.name}${getDetailsText(item)}`,
                        element: renderAddedElement(item),
                      })),
                    });
                  }

                  if (categoryChanges.task.added.length > 0) {
                    sectionsList.push({
                      title: "Tasks Added",
                      items: categoryChanges.task.added.map((item: SummaryAddedItem) => ({
                        text: `${item.name}${getDetailsText(item)}`,
                        element: renderAddedElement(item),
                      })),
                    });
                  }

                  if (categoryChanges.project.added.length > 0) {
                    sectionsList.push({
                      title: "Projects Added",
                      items: categoryChanges.project.added.map((item: SummaryAddedItem) => ({
                        text: `${item.name}${getDetailsText(item)}`,
                        element: renderAddedElement(item),
                      })),
                    });
                  }

                  if (categoryChanges.kpi.added.length > 0) {
                    sectionsList.push({
                      title: "KPI Added",
                      items: categoryChanges.kpi.added.map((item: SummaryAddedItem) => ({
                        text: `${item.name}${getDetailsText(item)}`,
                        element: renderAddedElement(item),
                      })),
                    });
                  }

                  if (categoryChanges.project.updated.length > 0) {
                    sectionsList.push({
                      title: "Projects Updated",
                      items: categoryChanges.project.updated.map((item: SummaryUpdatedItem) => ({
                        text: getUpdateSentence(item),
                        element: renderUpdateElement(item),
                      })),
                    });
                  }

                  if (categoryChanges.task.updated.length > 0) {
                    sectionsList.push({
                      title: "Tasks Updated",
                      items: categoryChanges.task.updated.map((item: SummaryUpdatedItem) => ({
                        text: getUpdateSentence(item),
                        element: renderUpdateElement(item),
                      })),
                    });
                  }

                  if (categoryChanges.kpi.updated.length > 0) {
                    sectionsList.push({
                      title: "KPIs Updated",
                      items: categoryChanges.kpi.updated.map((item: SummaryUpdatedItem) => ({
                        text: getUpdateSentence(item),
                        element: renderUpdateElement(item),
                      })),
                    });
                  }

                  if (categoryChanges.agenda.updated.length > 0) {
                    sectionsList.push({
                      title: "Objectives Updated",
                      items: categoryChanges.agenda.updated.map((item: SummaryUpdatedItem) => ({
                        text: getUpdateSentence(item),
                        element: renderUpdateElement(item),
                      })),
                    });
                  }

                  const allRemoved = [
                    ...categoryChanges.agenda.removed,
                    ...categoryChanges.task.removed,
                    ...categoryChanges.project.removed,
                    ...categoryChanges.kpi.removed,
                  ];

                  if (allRemoved.length > 0) {
                    sectionsList.push({
                      title: "Unlinked",
                      items: allRemoved.map((item: SummaryRemovedItem) => ({
                        text: getRemovedText(item),
                        element: renderRemovedElement(item),
                      })),
                    });
                  }

                  return (
                    <div className="max-w-3xl w-full border border-slate-200 rounded-2xl bg-white shadow-sm max-h-full flex flex-col overflow-hidden">
                        {/* Header: Title and Copy Button (Sticky at the top) */}
                        <div className="bg-[#2E3090] text-white p-4 rounded-t-2xl flex justify-between items-center shadow-sm shrink-0">
                          <h2 className="text-base sm:text-lg font-bold">
                            Meeting Summary – {summaryData?.meetingName || "Changes Recorded"}
                          </h2>
                          <button
                            type="button"
                            onClick={() => {
                              const lines = [];
                              lines.push(`MEETING SUMMARY – ${summaryData?.meetingName?.toUpperCase() || "CHANGES RECORDED"}`);
                              lines.push("");
                              if (summaryData?.meetingName && summaryData?.date) {
                                lines.push(`The following changes were recorded in the last meeting "${summaryData.meetingName}" held on ${formatSummaryDateTime(summaryData.date)}:`);
                              } else {
                                lines.push("The following changes were recorded in the last meeting:");
                              }
                              lines.push("");
                              
                              sectionsList.forEach((section) => {
                                lines.push(section.title);
                                section.items.forEach((item) => {
                                  lines.push(`  • ${item.text}`);
                                });
                                lines.push("");
                              });

                              const textToCopy = lines.join("\n");
                              navigator.clipboard.writeText(textToCopy);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="px-3 py-1.5 hover:bg-white/10 active:bg-white/20 rounded-lg transition-all flex items-center gap-1.5 text-xs text-white focus:outline-none border border-white/20 shrink-0"
                            title="Copy to Clipboard"
                          >
                            {copied ? (
                              <>
                                <span className="text-green-300 font-bold text-sm">✓</span>
                                <span className="opacity-95">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-white" />
                                <span className="opacity-90">Copy Summary</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Scrollable Content Wrapper */}
                        <div className="flex-1 overflow-y-auto p-6">
                          <p className="text-sm text-black mb-6 font-medium">
                            {summaryData?.meetingName && summaryData?.date ? (
                              <>
                                The following changes were recorded in the last meeting <strong className="font-semibold">"{summaryData.meetingName}"</strong> held on <span className="font-medium text-slate-800">{formatSummaryDateTime(summaryData.date)}</span>:
                              </>
                            ) : (
                              "The following changes were recorded in the last meeting:"
                            )}
                          </p>

                        {sectionsList.length === 0 ? (
                          <p className="text-sm text-black italic">No changes recorded during this meeting.</p>
                        ) : (
                          <div className="space-y-6">
                            {sectionsList.map((section, sIdx) => (
                              <div key={sIdx} className="space-y-2">
                                <h3 className="text-sm font-bold text-black">
                                  {section.title}
                                </h3>
                                <ul className="space-y-1.5 pl-4">
                                  {section.items.map((item, iIdx) => (
                                    <li key={iIdx} className="text-sm text-black leading-relaxed flex items-start gap-2">
                                      <span className="text-black shrink-0 select-none">•</span>
                                      <span>{item.element}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="max-w-3xl border rounded-sm overflow-y-scroll h-fit">
                  <div className="p-6">
                    <div className="text-center mb-6">
                      <h1
                        className="text-2xl font-bold text-navy-900 mb-2"
                        style={{ color: "#1e3a8a" }}
                      >
                        TIPS FOR WRITING A CLEAR & EFFECTIVE
                      </h1>
                      <h3
                        className="text-2xl font-bold text-navy-900 mb-2"
                        style={{ color: "#1e3a8a" }}
                      >
                        MEETING AGENDA
                      </h3>
                      <div className="w-20 h-1 bg-orange-400 mx-auto"></div>
                    </div>

                    <div className="space-y-6">
                      {tips.map((tip, index) => (
                        <div key={index} className="flex items-start space-x-6">
                          <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            {tip.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                              {tip.title}
                            </h4>
                            <p className="text-gray-600 text-base leading-relaxed">
                              {tip.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            ) : meetingStatus === "STARTED" ? (
              <div className="h-full w-full overflow-y-auto pr-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto py-2 justify-items-center">
                  {joiners &&
                    joiners.map((item) => {
                      return (
                        <div
                          key={item.employeeId}
                          className="flex items-center w-full justify-center"
                        >
                          <div className="flex gap-2 w-full max-w-[280px] border px-4 py-2 rounded-md justify-between items-center bg-white ">
                            <div className="relative flex gap-2 items-center w-full justify-between">
                              <div className="flex gap-2 items-center overflow-hidden">
                                {item.isTeamLeader && (
                                  <span className="absolute -top-2 left-5 z-10 bg-white shadow-2xl rounded-full p-0.5">
                                    <Crown className="w-3 h-3 text-[#303290] drop-shadow" />
                                  </span>
                                )}
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        {item.employeeImage !== null ? (
                                          <img
                                            src={`${ImageBaseURL}/share/profilePics/${item.employeeImage}`}
                                            alt={item.employeeName}
                                            className="w-full h-full object-cover outline-2 outline-blue-400 bg-black"
                                          />
                                        ) : (
                                          <div className="bg-gray-300 text-gray-700 w-full h-full content-center font-semibold text-sm flex items-center justify-center">
                                            {getInitials(item.employeeName)}
                                          </div>
                                        )}
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {item.employeeName}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <div className="text-sm font-medium text-gray-800 truncate">
                                  {item.employeeName}
                                </div>
                              </div>
                              <div className="shrink-0 flex items-center">
                                <FormCheckbox
                                  id={`${item.employeeId}-checkbox`}
                                  className="w-[15px] h-[15px]"
                                  containerClass="p-0 ml-3"
                                  checked={item.attendanceMark}
                                  onChange={(e) => {
                                    const updatedAttendance = e.target.checked;
                                    handleCheckIn(item, updatedAttendance);
                                  }}
                                  disabled={!(isTeamLeader || isSuperAdmin)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (meetingStatus === "DISCUSSION" ||
              meetingStatus === "CONCLUSION" ||
              meetingStatus === "ENDED") ? (
              detailAgendaData &&
              (() => {
                const selectedIoId =
                  ioType === "ISSUE"
                    ? agendaList?.find(
                        (Item) => Item.issueObjectiveId === isSelectedAgenda,
                      )?.issueId
                    : agendaList?.find(
                        (obj) => obj.issueObjectiveId === isSelectedAgenda,
                      )?.objectiveId;

                // const agendaSectionLabels: Record<string, string> = {
                //   tasks: "Tasks",
                //   kpis: "KPIs",
                //   projects: "Projects",
                // };

                // Helper to create individual section label — matches tab button style
                const sectionLabel = (label: string, count?: number) => (
                  <div className="flex items-center gap-1 text-lg font-semibold text-black">
                    <span>{label}</span>
                    {count !== undefined && (
                      <span className="text-sm font-normal text-gray-600">
                        ({count})
                      </span>
                    )}
                  </div>
                );

                const isStacked =
                  layoutMode === "stacked" ||
                  meetingStatus === "CONCLUSION" ||
                  meetingStatus === "ENDED";

                 const isExtra =
                  meetingStatus === "CONCLUSION" ||
                  meetingStatus === "ENDED";

                const agendaSections: Record<string, React.ReactNode> = {
                  tasks: (
                    <Tasks
                      key="tasks"
                      tasksFireBase={tasksFireBase}
                      issueId={selectedIoId}
                      ioType={ioType}
                      selectedIssueId={isSelectedAgenda}
                      isTeamLeader={isTeamLeader || isSuperAdmin}
                      isExtra={isExtra}
                      joiners={joiners}
                      headerLeft={
                        isStacked
                          ? sectionLabel("Tasks", detailAgendaData?.noOfTasks)
                          : undefined
                      }
                    />
                  ),
                  kpis: (
                    <KPITable
                      key="kpis"
                      meetingId={meetingId}
                      kpisFireBase={kpisFireBase}
                      ioId={selectedIoId}
                      ioType={ioType}
                      selectedIssueId={isSelectedAgenda}
                      isTeamLeader={isTeamLeader || isSuperAdmin}
                      follow={follow}
                      meetingRes={meetingResponse!}
                      meetingStatus={meetingStatus}
                      headerLeft={
                        isStacked
                          ? sectionLabel("KPIs", detailAgendaData?.noOfKPIs)
                          : undefined
                      }
                    />
                  ),
                  projects: (
                    <Projects
                      key="projects"
                      projectsFireBase={projectsFireBase}
                      issueId={selectedIoId}
                      ioType={ioType}
                      selectedIssueId={isSelectedAgenda}
                      isTeamLeader={isTeamLeader || isSuperAdmin}
                      isExtra={isExtra}
                      joiners={joiners}
                      headerLeft={
                        isStacked
                          ? sectionLabel(
                              "Projects",
                              detailAgendaData?.noOfProjects,
                            )
                          : undefined
                      }
                    />
                  ),
                };

                return (
                  <div
                    className={cn(
                      "h-full flex flex-col overflow-y-auto overflow-x-hidden w-full",
                      isStacked ? "p-4 bg-gray-200" : "p-4 bg-white"
                    )}
                  >
                    <Suspense fallback={<div>Loading...</div>}>
                      {!isStacked ? (
                        <div className="w-full bg-white">
                          {activeTab === "kpis" && agendaSections["kpis"]}
                          {activeTab === "projects" &&
                            agendaSections["projects"]}
                          {activeTab === "tasks" && agendaSections["tasks"]}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6 w-full">
                          {sectionOrder.map((key: string) => (
                            <div key={key} className="bg-white p-5 rounded-xl border border-gray-300 shadow-sm">
                              {agendaSections[key]}
                            </div>
                          ))}
                        </div>
                      )}
                    </Suspense>
                  </div>
                );
              })()
            ) : conclusionLoading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin">
                  <SpinnerIcon />
                </div>
              </div>
            ) : (
              <div className="flex-1 h-[calc(var(--vh,100vh)-220px)] overflow-x-hidden overflow-y-auto w-full">
                <div>
                  {!selectedItem || !hasChanges(selectedItem) ? (
                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg mt-6 p-8 text-center">
                      <div className="text-gray-400 mb-2">
                        <Target className="w-12 h-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        Select Issue or Objective
                      </h3>
                      <p className="text-gray-500">
                        Please Select any Issue or Objective to Detail
                        Discussion of it.
                      </p>
                    </div>
                  ) : (
                    <>
                      {selectedItem &&
                        selectedItem?.discussion.taskUpdate.length > 0 && (
                          <div>
                            <div className="bg-primary text-white p-2 px-4">
                              <p>Task Name</p>
                            </div>
                            <div className="my-2">
                              {selectedItem?.discussion.taskUpdate
                                ?.filter(
                                  (item) =>
                                    item && item.oldValues && item.newValues,
                                )
                                .map((task, idx) => {
                                  // Get all possible keys from both old and new values
                                  const allKeys = [
                                    ...new Set([
                                      ...Object.keys(task.oldValues),
                                      ...Object.keys(task.newValues),
                                    ]),
                                  ].filter(
                                    (data) => data !== "taskId",
                                  ) as Array<keyof typeof task.oldValues>;

                                  const isNewValueEmpty =
                                    !task.newValues ||
                                    Object.keys(task.newValues).length === 0;

                                  return (
                                    <div
                                      key={idx}
                                      className="flex overflow-hidden border-b py-2"
                                    >
                                      <div className="w-1/3 pl-4">
                                        <h4 className="font-medium text-gray-800">
                                          {task.oldValues.taskName !==
                                          task.newValues.taskName ? (
                                            <>
                                              <span className="text-red-500 line-through">
                                                {task.oldValues.taskName}
                                              </span>
                                              <span className="text-green-600 ml-2">
                                                {task.newValues.taskName}
                                              </span>
                                            </>
                                          ) : (
                                            task.newValues.taskName
                                          )}{" "}
                                          &nbsp; DISCUSSION &nbsp;
                                          {isNewValueEmpty && "Removed"}
                                        </h4>
                                      </div>
                                      <div className="w-2/3">
                                        <div className="space-y-1">
                                          {allKeys.map((key) => {
                                            const oldValue =
                                              task.oldValues[key];
                                            const newValue =
                                              task.newValues[key];

                                            // Only show if values are different
                                            if (oldValue !== newValue) {
                                              return (
                                                <div
                                                  key={String(key)}
                                                  className="text-sm"
                                                >
                                                  <span className="font-medium text-gray-600 capitalize">
                                                    {key
                                                      .toString()
                                                      .replace("task", "")
                                                      .replace(
                                                        /([A-Z])/g,
                                                        " $1",
                                                      )
                                                      .trim()}
                                                    :
                                                  </span>{" "}
                                                  <span className="text-red-500 line-through">
                                                    {oldValue?.toString() ||
                                                      "N/A"}
                                                  </span>
                                                  <span className="mx-2 text-gray-400">
                                                    →
                                                  </span>
                                                  <span className="text-green-600">
                                                    {newValue?.toString() ||
                                                      "N/A"}
                                                  </span>
                                                </div>
                                              );
                                            }
                                            return null;
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}

                      {selectedItem &&
                        selectedItem?.discussion.projectUpdate.length > 0 && (
                          <div className="mt-5">
                            <div className="bg-primary text-white p-2 px-4">
                              <p>Project Name</p>
                            </div>
                            <div className="my-2">
                              {selectedItem?.discussion.projectUpdate
                                ?.filter(
                                  (item) =>
                                    item && item.oldValues && item.newValues,
                                )
                                .map((project, idx) => {
                                  const allKeys = [
                                    ...new Set([
                                      ...Object.keys(project.oldValues),
                                      ...Object.keys(project.newValues),
                                    ]),
                                  ].filter(
                                    (data) => data !== "projectId",
                                  ) as Array<keyof typeof project.oldValues>;

                                  const isNewValueEmpty =
                                    !project.newValues ||
                                    Object.keys(project.newValues).length === 0;

                                  return (
                                    <div
                                      key={idx}
                                      className="flex overflow-hidden border-b py-2"
                                    >
                                      <div className="w-1/3 pl-4">
                                        <h4 className="font-medium text-gray-800">
                                          {project.oldValues.projectName !==
                                          project.newValues.projectName ? (
                                            <>
                                              <span className="text-red-500 line-through">
                                                {project.oldValues.projectName}
                                              </span>
                                              <span className="text-green-600 ml-2">
                                                {project.newValues.projectName}
                                              </span>
                                            </>
                                          ) : (
                                            project.newValues.projectName
                                          )}
                                          &nbsp; DISCUSSION &nbsp;
                                          {isNewValueEmpty && "Removed"}
                                        </h4>
                                      </div>
                                      <div className="w-2/3">
                                        <div className="space-y-1">
                                          {allKeys.map((key) => {
                                            const oldValue =
                                              project.oldValues[key];
                                            const newValue =
                                              project.newValues[key];

                                            if (key === "subParameters")
                                              return null;

                                            // Check if this is a date field (you might need to adjust this condition)
                                            const isDateField =
                                              key
                                                .toString()
                                                .toLowerCase()
                                                .includes("date") ||
                                              key
                                                .toString()
                                                .toLowerCase()
                                                .includes("deadline");

                                            if (oldValue !== newValue) {
                                              return (
                                                <div
                                                  key={String(key)}
                                                  className="text-sm"
                                                >
                                                  <span className="font-medium text-gray-600 capitalize">
                                                    {key
                                                      .toString()
                                                      .replace("project", "")
                                                      .replace(
                                                        /([A-Z])/g,
                                                        " $1",
                                                      )
                                                      .trim()}
                                                    :
                                                  </span>{" "}
                                                  <span className="text-red-500 line-through">
                                                    {isDateField
                                                      ? formatLocalDate(
                                                          oldValue,
                                                        )
                                                      : oldValue?.toString() ||
                                                        "N/A"}
                                                  </span>
                                                  <span className="mx-2 text-gray-400">
                                                    →
                                                  </span>
                                                  <span className="text-green-600">
                                                    {isDateField
                                                      ? formatLocalDate(
                                                          newValue,
                                                        )
                                                      : newValue?.toString() ||
                                                        "N/A"}
                                                  </span>
                                                </div>
                                              );
                                            }
                                            return null;
                                          })}

                                          {/* Special handling for subParameters */}
                                          {project.newValues.subParameters && (
                                            <div className="text-sm">
                                              <span className="font-medium text-gray-600 capitalize">
                                                Sub Parameters:
                                              </span>{" "}
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {project.newValues.subParameters
                                                  ?.split(",")
                                                  .map((param, paramIdx) => (
                                                    <span
                                                      key={paramIdx}
                                                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                                    >
                                                      {param.trim()}
                                                    </span>
                                                  ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}

                      {selectedItem &&
                        selectedItem?.discussion.kpiUpdate.length > 0 && (
                          <div className="mt-5">
                            <div className="bg-primary text-white p-2 px-4">
                              <p>KPIs Name</p>
                            </div>
                            <div className="my-2">
                              {selectedItem?.discussion.kpiUpdate
                                ?.filter(
                                  (kpi) =>
                                    kpi && kpi.oldValues && kpi.newValues,
                                )
                                .map((kpi: KpiUpdate, idx: number) => {
                                  const allKeys = [
                                    ...new Set([
                                      ...Object.keys(kpi.oldValues),
                                      ...Object.keys(kpi.newValues),
                                    ]),
                                  ].filter((key) => key !== "kpiId") as Array<
                                    keyof typeof kpi.oldValues
                                  >;
                                  const hasChange =
                                    allKeys.some(
                                      (key) =>
                                        kpi.oldValues[key] !==
                                        kpi.newValues[key],
                                    ) ||
                                    (kpi.oldData?.length || 0) > 0 ||
                                    (kpi.newData?.length || 0) > 0;

                                  const isNewValueEmpty =
                                    !kpi.newValues ||
                                    Object.keys(kpi.newValues).length === 0;

                                  return (
                                    <div
                                      key={idx}
                                      className="overflow-hidden border-b py-3"
                                    >
                                      {/* KPI Name */}
                                      <h4 className="font-medium text-gray-800 pl-4">
                                        {kpi.oldValues.kpiName !==
                                        kpi.newValues.kpiName ? (
                                          <>
                                            <span className="text-red-500 line-through">
                                              {kpi.oldValues.kpiName}
                                            </span>
                                            <span className="text-green-600 ml-2">
                                              {kpi.newValues.kpiName}
                                            </span>
                                          </>
                                        ) : (
                                          kpi.newValues.kpiName
                                        )}
                                        &nbsp; DISCUSSION &nbsp;
                                        {isNewValueEmpty && "Removed"}
                                      </h4>

                                      {hasChange && (
                                        <div className="mt-2 grid grid-cols-2 gap-4 px-4">
                                          {/* Old Values */}
                                          <div>
                                            <p className="font-medium text-gray-600 mb-1">
                                              Old Values
                                            </p>
                                            <div className="space-y-1 text-sm">
                                              {allKeys.map((key) => (
                                                <div key={String(key)}>
                                                  <span className="capitalize">
                                                    {key
                                                      .toString()
                                                      .replace("kpi", "")
                                                      .replace(
                                                        /([A-Z])/g,
                                                        " $1",
                                                      )
                                                      .trim()}
                                                    :
                                                  </span>{" "}
                                                  {kpi.oldValues[
                                                    key
                                                  ]?.toString() || "N/A"}
                                                </div>
                                              ))}

                                              {kpi.oldData &&
                                                kpi.oldData.map(
                                                  (oldDataItem, i) => (
                                                    <div key={i}>
                                                      {formatDate(
                                                        oldDataItem.startDate,
                                                      )}{" "}
                                                      :{" "}
                                                      {oldDataItem.data ||
                                                        "N/A"}
                                                    </div>
                                                  ),
                                                )}
                                            </div>
                                          </div>

                                          {/* New Values */}
                                          <div>
                                            <p className="font-medium text-gray-600 mb-1">
                                              New Values
                                            </p>
                                            <div className="space-y-1 text-sm">
                                              {allKeys.map((key) => (
                                                <div key={String(key)}>
                                                  <span className="capitalize">
                                                    {key
                                                      .toString()
                                                      .replace("kpi", "")
                                                      .replace(
                                                        /([A-Z])/g,
                                                        " $1",
                                                      )
                                                      .trim()}
                                                    :
                                                  </span>{" "}
                                                  {kpi.newValues[
                                                    key
                                                  ]?.toString() || "N/A"}
                                                </div>
                                              ))}

                                              {kpi.newData &&
                                                kpi.newData.map(
                                                  (newDataItem, i) => (
                                                    <div key={i}>
                                                      {formatDate(
                                                        newDataItem.startDate,
                                                      )}{" "}
                                                      :{" "}
                                                      {newDataItem.data ||
                                                        "N/A"}
                                                    </div>
                                                  ),
                                                )}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
