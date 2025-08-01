import { useEffect, useState } from "react";

import {
  AlertTriangle,
  BarChart2,
  CheckCircle,
  CheckSquare,
  CircleX,
  Clock,
  CornerDownLeft,
  List,
  SquarePen,
  Target,
  Trash2,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Badge } from "@/components/ui/badge";
import MeetingTimer from "../meetingTimer";
import { cn } from "@/lib/utils";
import { useAgenda } from "./useAgenda";
import Tasks from "../Tasks";
import Projects from "../Projects";
import KPITable from "../KpiTable";
import Timer from "../Timer";
import { SpinnerIcon } from "@/components/shared/Icons";
import { formatDate } from "@/features/utils/app.utils";

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
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div className="bg-white w-96 p-5 rounded-md shadow-2xl border-2">
        <p>Value: {issue}</p>
        <div className="my-3">
          <RadioGroup value={selectedType} onValueChange={setSelectedType}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="issue" id="r1" />
              <label htmlFor="r1">Issue</label>
              <RadioGroupItem value="objective" id="r2" className="ml-6" />
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
        <Button onClick={onClose} style={{ marginLeft: 8 }}>
          Close
        </Button>
      </div>
    </div>
  );
}

interface AgendaProps {
  meetingName: string;
  meetingId: string;
  meetingStatus?: string;
  meetingResponse?: MeetingResFire | null;
  agendaPlannedTime: number | string | undefined;
  detailMeetingId: string | undefined;
  joiners: Joiners[];
  meetingTime?: string;
  isTeamLeader: boolean | undefined;
  isCheckIn?: boolean;
}

export default function Agenda({
  meetingName,
  meetingId,
  meetingStatus,
  meetingResponse,
  detailMeetingId,
  meetingTime,
  isTeamLeader,
  isCheckIn,
}: AgendaProps) {
  const {
    issueInput,
    editing,
    modalOpen,
    modalIssue,
    dropdownVisible,
    agendaList,
    draggedIndex,
    hoverIndex,
    isSelectedAgenda,
    isSideBar,
    filteredIssues,
    searchOptions,
    // formattedTime,
    setIssueInput,
    setEditingValue,
    setModalOpen,
    setDropdownVisible,
    handleAddIssue,
    startEdit,
    cancelEdit,
    updateEdit,
    handleDelete,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
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
    handleStartMeeting,
    handleCloseMeetingWithLog,
    endMeetingLoading,
    conclusionData,
    conclusionLoading,
    hasChanges,
    selectedItem,
    // handleJoinMeeting,
  } = useAgenda({
    meetingId,
    meetingStatus,
    meetingResponse,
    detailMeetingId,
    canEdit: true,
  });
  const [contentWidth, setContentWidth] = useState("90%");

  const SIDEBAR_WIDTH = 600;

  const updateWidth = () => {
    const screenWidth = window.innerWidth;
    if (isSideBar) {
      setContentWidth(`${screenWidth - SIDEBAR_WIDTH}px`);
    } else {
      setContentWidth("90%");
    }
  };

  useEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSideBar]);

  const canEdit = true;

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  function formatSecondsToHHMM(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}h:${minutes.toString().padStart(2, "0")}m`;
  }
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "delayed":
        return <AlertTriangle className="w-4 h-4" />;
      case "in progress":
        return <Clock className="w-4 h-4" />;
      case "blasted":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "delayed":
        return "text-red-600 bg-red-100";
      case "in progress":
        return "text-yellow-600 bg-yellow-100";
      case "blasted":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const renderStatusChange = (oldStatus: string, newStatus: string) => {
    if (oldStatus === newStatus) {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(newStatus)}`}
        >
          {getStatusIcon(newStatus)}
          {newStatus}
        </span>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(oldStatus)}`}
        >
          {getStatusIcon(oldStatus)}
          {oldStatus}
        </span>
        <span className="text-gray-400">→</span>
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(newStatus)}`}
        >
          {getStatusIcon(newStatus)}
          {newStatus}
        </span>
      </div>
    );
  };

  const meetingStatusLabels = {
    NOT_STARTED: "Not Started",
    STARTED: "Started",
    DISCUSSION: "Discussion",
    CONCLUSION: "Conclusion",
    ENDED: "Ended",
  };

  return (
    <div>
      <IssueModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        issue={modalIssue}
        defaultType=""
        onSubmit={handleModalSubmit}
      />
      <div className="flex gap-3 transition-all duration-1000">
        <div
          className={cn(
            // "transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.5,1)]",
            "ease-out",
            isSideBar ? "w-[370px] min-w-[370px]" : "w-[65%]",
          )}
        >
          <div className="flex gap-2 relative">
            {(meetingStatus === "STARTED" ||
              meetingStatus === "NOT_STARTED") && (
              <div className="flex gap-2 relative w-full">
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
                      handleAddIssue();
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
                        {item.name} ({item.type})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <div className="mt-2 h-[calc(100vh-150px)] pr-1 w-full overflow-auto">
            {agendaList && agendaList.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {agendaList.map((item, idx) => (
                  <li
                    key={item.issueObjectiveId}
                    className={`group px-2 flex w-full 
                      ${
                        meetingStatus === "STARTED" ||
                        (meetingStatus === "NOT_STARTED" ? "h-14" : "h-20")
                      }
                      ${
                        isSelectedAgenda === item.detailMeetingAgendaIssueId
                          ? "bg-primary text-white"
                          : ""
                      } mb-2 rounded-md shadow ${
                        meetingStatus === "STARTED" ||
                        meetingStatus === "NOT_STARTED"
                          ? "cursor-pointer"
                          : "opacity-100"
                      }`}
                    draggable={
                      meetingStatus === "STARTED" ||
                      meetingStatus === "NOT_STARTED"
                    }
                    onDragStart={
                      meetingStatus === "STARTED" ||
                      meetingStatus === "NOT_STARTED"
                        ? () => handleDragStart(idx)
                        : undefined
                    }
                    onDragOver={
                      meetingStatus === "STARTED" ||
                      meetingStatus === "NOT_STARTED"
                        ? (e) => handleDragOver(e, idx)
                        : undefined
                    }
                    onDragLeave={
                      meetingStatus === "STARTED" ||
                      meetingStatus === "NOT_STARTED"
                        ? handleDragLeave
                        : undefined
                    }
                    onDrop={
                      meetingStatus === "STARTED" ||
                      meetingStatus === "NOT_STARTED"
                        ? () => handleDrop(idx)
                        : undefined
                    }
                    onClick={() => {
                      if (
                        meetingStatus !== "STARTED" &&
                        meetingStatus !== "NOT_STARTED"
                      ) {
                        handleListClick(item.detailMeetingAgendaIssueId ?? "");
                      }
                    }}
                    style={{
                      opacity: draggedIndex === idx ? 0.5 : 1,
                      cursor:
                        meetingStatus === "STARTED" ||
                        meetingStatus === "NOT_STARTED"
                          ? "move"
                          : "default",
                      border:
                        hoverIndex === idx &&
                        (meetingStatus === "STARTED" ||
                          meetingStatus === "NOT_STARTED")
                          ? "2px dashed #3b82f6"
                          : "1px solid #eee",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "border 0.2s ease",
                      position: "relative",
                    }}
                  >
                    {hoverIndex === idx &&
                      (meetingStatus === "STARTED" ||
                        meetingStatus === "NOT_STARTED") && (
                        <div
                          style={{
                            position: "absolute",
                            top:
                              draggedIndex !== null && draggedIndex < idx
                                ? "100%"
                                : 0,
                            left: 0,
                            right: 0,
                            height: "2px",
                            backgroundColor: "#3b82f6",
                            transform:
                              draggedIndex !== null && draggedIndex < idx
                                ? "translateY(-1px)"
                                : "translateY(-1px)",
                          }}
                        />
                      )}
                    <div className="flex items-center w-full">
                      {(meetingStatus === "STARTED" ||
                        meetingStatus === "NOT_STARTED") && (
                        <span style={{ marginRight: 8, cursor: "grab" }}>
                          ⋮⋮
                        </span>
                      )}
                      {editing.type === item.agendaType &&
                      editing.id === item.issueObjectiveId &&
                      canEdit ? null : (
                        <div className="w-full flex items-center">
                          <div
                            className={`text-sm ${meetingStatus === "STARTED" || meetingStatus === "NOT_STARTED" ? "w-[calc(100%-50px)] pr-8 h-14 flex items-center" : "w-[75%] min-w-52 max-w-[75%]"}  overflow-hidden line-clamp-3 ml-2`}
                          >
                            {item.name}
                          </div>

                          <div
                            className={`text-xs text-center w-20 text-gray-500 ${
                              meetingStatus === "STARTED" ||
                              meetingStatus === "NOT_STARTED"
                                ? "group-hover:hidden"
                                : ""
                            }   absolute top-3 right-3`}
                          >
                            <Badge variant="secondary" className="mb-1.5">
                              {item.agendaType}
                            </Badge>
                            <div className="text-sm font-medium text-primary">
                              {meetingStatus !== "STARTED" &&
                                meetingStatus !== "NOT_STARTED" &&
                                item.detailMeetingAgendaIssueId && (
                                  <div>
                                    {meetingStatus === "DISCUSSION" ? (
                                      <Timer
                                        actualTime={Number(
                                          meetingResponse?.timers.objectives?.[
                                            item.detailMeetingAgendaIssueId ??
                                              ""
                                          ]?.actualTime || 0,
                                        )}
                                        defaultTime={Number(
                                          meetingResponse?.timers.objectives?.[
                                            item.detailMeetingAgendaIssueId ??
                                              ""
                                          ]?.actualTime || 0,
                                        )}
                                        lastSwitchTimestamp={
                                          isSelectedAgenda ===
                                          item.detailMeetingAgendaIssueId
                                            ? Number(
                                                meetingResponse?.state
                                                  .lastSwitchTimestamp ||
                                                  Date.now(),
                                              )
                                            : 0
                                        }
                                        isActive={
                                          isSelectedAgenda ===
                                          item.detailMeetingAgendaIssueId
                                        }
                                        className={`text-xl ${
                                          isSelectedAgenda ===
                                          item.detailMeetingAgendaIssueId
                                            ? "text-white"
                                            : ""
                                        }`}
                                      />
                                    ) : (
                                      <div
                                        className={`text-xl ${
                                          isSelectedAgenda ===
                                          item.detailMeetingAgendaIssueId
                                            ? "text-white"
                                            : ""
                                        }`}
                                      >
                                        {formatTime(
                                          Number(
                                            conclusionData &&
                                              conclusionData?.agenda.find(
                                                (con) =>
                                                  con.detailMeetingAgendaIssueId ===
                                                  item.detailMeetingAgendaIssueId,
                                              )?.actualTime,
                                          ),
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {(meetingStatus === "STARTED" ||
                      meetingStatus === "NOT_STARTED") && (
                      <div>
                        {editing.type === item.agendaType &&
                        editing.id === item.issueObjectiveId &&
                        canEdit ? (
                          <div className="w-full flex items-center gap-1">
                            <div className="relative w-full flex gap-2 items-center">
                              <Input
                                value={editing.value}
                                onChange={(e) =>
                                  setEditingValue(e.target.value)
                                }
                                className="mr-2"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    updateEdit();
                                  }
                                }}
                              />
                              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-sm">
                                <CornerDownLeft className="text-gray-400 w-4" />
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEdit}
                            >
                              <CircleX />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-4 items-center">
                            {canEdit && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  onClick={() =>
                                    startEdit(
                                      item.agendaType === "objective"
                                        ? "objective"
                                        : "issue",
                                      item.issueObjectiveId,
                                      item.name,
                                      item.plannedTime || "0",
                                      String(item.detailMeetingAgendaIssueId),
                                    )
                                  }
                                  className="w-5"
                                >
                                  <SquarePen className="h-4 w-4 text-primary" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  onClick={() => handleDelete(item)}
                                  className="w-5"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No issues added</p>
            )}
          </div>
        </div>
        <div style={{ width: contentWidth }}>
          <div className="flex gap-3 mb-4">
            <div className="w-full">
              {meetingStatus === "STARTED" ||
              meetingStatus === "NOT_STARTED" ? (
                <div className="w-full flex h-[40px] border border-gray-300 rounded-[10px] items-center px-4">
                  <div className="flex-1 text-lg  w-[30%] text-primary ml-3 font-semibold truncate">
                    {meetingName}
                  </div>

                  <div className="hidden md:block w-[50%] text-gray-500  text-lg truncate ml-4">
                    Meeting Agenda
                  </div>
                </div>
              ) : meetingStatus === "DISCUSSION" ? (
                <div className="w-fit">
                  <nav className="space-y-1 w-full ">
                    <div className="mr-5 flex gap-3 items-center rounded-2xl px-1">
                      <Button
                        variant={activeTab === "tasks" ? "default" : "ghost"}
                        className={`w-40 h-12 justify-start border cursor-pointer flex items-center`}
                        onClick={() => {
                          handleTabChange("tasks");
                        }}
                      >
                        <List className="h-5 w-5" />
                        <span className="ml-2">Tasks</span>
                      </Button>
                      <Button
                        variant={activeTab === "projects" ? "default" : "ghost"}
                        className={`w-40 h-12 justify-start border cursor-pointer flex items-center `}
                        onClick={() => {
                          handleTabChange("projects");
                        }}
                      >
                        <CheckSquare className="h-5 w-5" />
                        <span className="ml-2">Projects</span>
                      </Button>
                      <Button
                        variant={activeTab === "kpis" ? "default" : "ghost"}
                        className={`w-40 h-12 justify-start border cursor-pointer flex items-center`}
                        onClick={() => {
                          handleTabChange("kpis");
                        }}
                      >
                        <BarChart2 className="h-5 w-5" />
                        <span className="ml-2">KPIs</span>
                      </Button>
                    </div>
                  </nav>
                </div>
              ) : (
                <div className="flex gap-4 items-center flex-wrap">
                  <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-sm">Agenda Actual:</span>
                    <span className="font-bold">
                      {formatTime(Number(conclusionData?.agendaActual))}m
                    </span>
                  </div>

                  <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-sm">
                      Discussion Actual:
                    </span>
                    <span className="font-bold">
                      {formatTime(Number(conclusionData?.agendaTotalActual))}m
                    </span>
                  </div>

                  {conclusionData?.conclusionActual != null && (
                    <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-sm">
                        Conclusion Actual:
                      </span>
                      <span className="font-bold">
                        {formatTime(Number(conclusionData.conclusionActual))}m
                      </span>
                    </div>
                  )}

                  {conclusionData?.meetingPlanned != null && (
                    <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-sm">
                        Meeting Planned:
                      </span>
                      <span className="font-bold">
                        {formatSecondsToHHMM(
                          Number(conclusionData.meetingPlanned),
                        )}
                      </span>
                    </div>
                  )}

                  {conclusionData?.meetingActual != null &&
                    conclusionData?.meetingActual != "0" && (
                      <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-sm">
                          Meeting Actual:
                        </span>
                        <span className="font-bold">
                          {formatSecondsToHHMM(
                            Number(conclusionData.meetingActual),
                          )}
                        </span>
                      </div>
                    )}
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                      <span className="font-medium text-sm">Total Tasks:</span>
                      <span className="font-bold">
                        {conclusionData?.noOfTasks}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                      <span className="font-medium text-sm">
                        Total Projects:
                      </span>
                      <span className="font-bold">
                        {conclusionData?.noOfProjects}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                      <span className="font-medium text-sm">Total KPIs:</span>
                      <span className="font-bold">
                        {conclusionData?.noOfKPIs}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {meetingStatus !== "ENDED" && (
              <div className="flex flex-wrap transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.5,1)] md:flex-nowrap items-center gap-3 w-[30%] md:w-auto">
                {meetingStatus === "NOT_STARTED" && isTeamLeader && (
                  <Button
                    variant="outline"
                    className="w-[200px] h-[40px] transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.5,1)] bg-primary text-white rounded-[10px] cursor-pointer text-lg font-semibold flex items-center justify-center gap-2"
                    onClick={handleStartMeeting}
                    isLoading={isPending}
                  >
                    Start Meeting
                  </Button>
                )}

                {!isTeamLeader && (
                  <Button
                    variant="outline"
                    className="w-[200px] h-[40px] cursor-not-allowed transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.5,1)] bg-primary text-white rounded-[10px] text-lg font-semibold"
                    // onClick={handleJoinMeeting}
                  >
                    {
                      meetingStatusLabels[
                        meetingStatus as keyof typeof meetingStatusLabels
                      ]
                    }
                  </Button>
                )}

                {isTeamLeader && isCheckIn && (
                  <>
                    {meetingStatus === "STARTED" && (
                      <Button
                        variant="outline"
                        className="w-[200px] h-[40px] transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.5,1)] bg-primary text-white rounded-[10px] cursor-pointer text-lg font-semibold"
                        onClick={handleDesc}
                        isLoading={isPending}
                      >
                        Start Discussion
                      </Button>
                    )}
                    {meetingStatus === "DISCUSSION" && (
                      <Button
                        variant="outline"
                        className="w-[200px] h-[40px] transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.5,1)] bg-primary text-white rounded-[10px] cursor-pointer text-lg font-semibold"
                        onClick={handleConclusionMeeting}
                      >
                        Go To Conclusion
                      </Button>
                    )}
                    {meetingStatus === "CONCLUSION" && (
                      <Button
                        variant="outline"
                        className="bg-primary transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.5,1)] text-white px-4 py-5 text-sm sm:text-base md:text-lg"
                        onClick={handleCloseMeetingWithLog}
                        isLoading={endMeetingLoading}
                      >
                        End Meeting
                      </Button>
                    )}
                  </>
                )}

                {meetingStatus !== "ENDED" && (
                  <div className="w-fit transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.5,1)] px-2 pl-4 h-[40px] border-gray-300 rounded-[10px] flex items-center justify-center">
                    <MeetingTimer
                      meetingTime={Number(meetingTime)}
                      actualTime={0}
                      lastSwitchTimestamp={Number(
                        meetingResponse?.state.meetingTimestamp,
                      )}
                      meetingStart={meetingStatus !== "NOT_STARTED"}
                      className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary"
                      onTimeUpdate={handleTimeUpdate}
                      isEditMode={isTeamLeader}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="border rounded-md flex  justify-center w-full h-[calc(100vh-200px)] overflow-scroll">
            {meetingStatus === "STARTED" || meetingStatus === "NOT_STARTED" ? (
              <div className="w-[500px] h-[calc(100vh-250px)] flex items-center text-justify leading-8">
                📌 Tips for Writing a Clear & Effective Meeting Agenda Start
                with the Goal ➤ What is the purpose of the meeting? Summarize it
                in one sentence. List Key Discussion Points ➤ Break down the
                agenda into focused, time-boxed topics. E.g., "Marketing Update
                (10 mins)" or "Budget Review (15 mins)" Prioritize High-Impact
                Items First ➤ Cover the most important topics early, when
                attention is highest. Assign Owners to Agenda Items ➤ Add who
                will lead each topic to encourage preparation. Add Time
                Estimates ➤ Helps keep the meeting on track and avoids overruns.
                Leave Room for Questions or Open Discussion ➤ Allot a few
                minutes at the end to address any additional points. Distribute
                Agenda Before the Meeting ➤ Share the agenda with participants
                at least a day in advance. Be Specific, Not Vague ✘ Bad:
                "Project discussion" ✔ Good: "Decide launch date for Phase 2 of
                Project Phoenix"
              </div>
            ) : meetingStatus === "DISCUSSION" ? (
              detailAgendaData && (
                <div className="max-h-full h-auto mt-8 px-2 w-full">
                  {activeTab === "tasks" && (
                    <Tasks
                      tasksFireBase={tasksFireBase}
                      meetingAgendaIssueId={isSelectedAgenda}
                      detailMeetingId={detailMeetingId}
                    />
                  )}
                  {activeTab === "projects" && (
                    <Projects
                      meetingId={meetingId}
                      projectsFireBase={projectsFireBase}
                      meetingAgendaIssueId={isSelectedAgenda}
                      detailMeetingId={detailMeetingId}
                    />
                  )}
                  {activeTab === "kpis" && (
                    <KPITable
                      meetingId={meetingId}
                      kpisFireBase={kpisFireBase}
                      meetingAgendaIssueId={isSelectedAgenda}
                      detailMeetingId={detailMeetingId}
                    />
                  )}
                </div>
              )
            ) : conclusionLoading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin">
                  <SpinnerIcon />
                </div>
              </div>
            ) : (
              <div className="flex-1 px-6 h-[calc(100vh-230px)] overflow-x-scroll w-full">
                <div className="space-y-6 ">
                  {!selectedItem || !hasChanges(selectedItem) ? (
                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg mt-6 p-8 text-center">
                      <div className="text-gray-400 mb-2">
                        <Target className="w-12 h-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        No Updates Recorded
                      </h3>
                      <p className="text-gray-500">
                        This agenda item was discussed but no specific updates
                        were recorded.
                      </p>
                    </div>
                  ) : (
                    <>
                      {selectedItem &&
                        selectedItem?.discussion.taskUpdate.length > 0 && (
                          <div className="bg-white border rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                              <CheckCircle className="w-6 h-6 text-blue-600" />
                              <h3 className="text-lg font-semibold text-gray-800">
                                Tasks Updates
                              </h3>
                              <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                                {selectedItem?.discussion.taskUpdate.length}{" "}
                                updates
                              </span>
                            </div>
                            <div className="space-y-4">
                              {selectedItem?.discussion.taskUpdate.map(
                                (task, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-gray-100 p-4 rounded-lg"
                                  >
                                    <h4 className="font-medium text-gray-800 mb-2">
                                      Task Name : {task.newValues.taskName}
                                    </h4>
                                    {(task.oldValues.taskStatus ||
                                      task.newValues.taskStatus) && (
                                      <p className="text-sm text-gray-700">
                                        <span className="text-red-500">
                                          {task.oldValues.taskStatus || "N/A"}
                                        </span>
                                        ➜
                                        <span className="text-green-600">
                                          {task.newValues.taskStatus || "N/A"}
                                        </span>
                                      </p>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {selectedItem &&
                        selectedItem?.discussion.projectUpdate.length > 0 && (
                          <div className="bg-white border rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                              <Users className="w-6 h-6 text-green-600" />
                              <h3 className="text-lg font-semibold text-gray-800">
                                Projects Updates
                              </h3>
                              <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                                {selectedItem?.discussion.projectUpdate.length}{" "}
                                updates
                              </span>
                            </div>
                            <div className="space-y-4">
                              {selectedItem?.discussion.projectUpdate.map(
                                (project, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-gray-100 p-4 rounded-lg"
                                  >
                                    <div className="flex items-start justify-between mb-3">
                                      <div>
                                        <h4 className="font-medium text-gray-800">
                                          Project Name :{" "}
                                          {project.newValues.projectName}
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                          {project.newValues.projectDescription}
                                        </p>
                                      </div>
                                    </div>
                                    {project.oldValues.projectStatus ||
                                      (project.newValues.projectStatus && (
                                        <div className="mb-3">
                                          {renderStatusChange(
                                            project.oldValues.projectStatus,
                                            project.newValues.projectStatus,
                                          )}
                                        </div>
                                      ))}

                                    <div className="flex flex-wrap gap-2 mb-2">
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
                                    {project.newValues.projectEmployees && (
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Users className="w-4 h-4" />
                                        <span>
                                          Team:{" "}
                                          {project.newValues.projectEmployees}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {selectedItem &&
                        selectedItem?.discussion.kpiUpdate.length > 0 && (
                          <div className="bg-white border rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                              <TrendingUp className="w-6 h-6 text-purple-600" />
                              <h3 className="text-lg font-semibold text-gray-800">
                                KPIs Updates
                              </h3>
                              <span className="bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded-full">
                                {selectedItem?.discussion.kpiUpdate.length}{" "}
                                updates
                              </span>
                            </div>
                            <div className="space-y-4">
                              {selectedItem?.discussion.kpiUpdate.map(
                                (kpi, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-gray-100 p-4 rounded-lg"
                                  >
                                    <div className="flex items-start justify-between mb-3">
                                      <div>
                                        <h4 className="font-medium text-gray-800">
                                          KPI Name : {kpi.newValues.kpiName}
                                        </h4>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                          {kpi.newValues.kpiFrequency && (
                                            <span>
                                              Frequency:{" "}
                                              {kpi.newValues.kpiFrequency}
                                            </span>
                                          )}
                                          {kpi.newValues.value1 && (
                                            <span>
                                              Target: {kpi.newValues.value1}
                                              {kpi.newValues.kpiUnit}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {kpi.newValues.tag && (
                                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                          {kpi.newValues.tag}
                                        </span>
                                      )}
                                    </div>

                                    {kpi.recData && kpi.recData.length > 0 && (
                                      <div className="mt-3">
                                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                                          Recent Data:
                                        </h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {kpi.recData.map((data, dataIdx) => (
                                            <div
                                              key={dataIdx}
                                              className="bg-white p-2 rounded border"
                                            >
                                              <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">
                                                  {formatDate(data.startDate)}
                                                </span>
                                                <span className="font-semibold text-lg text-purple-600">
                                                  {data.data}
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ),
                              )}
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
