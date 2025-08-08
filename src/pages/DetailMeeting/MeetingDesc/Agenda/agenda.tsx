import { useEffect, useState } from "react";

import {
  ArrowUp,
  BarChart2,
  Calendar,
  CheckSquare,
  CircleX,
  Clock,
  CornerDownLeft,
  Crown,
  FileText,
  List,
  Plus,
  SquarePen,
  Target,
  Trash2,
  User,
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
import { formatDate, getInitials } from "@/features/utils/app.utils";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FormCheckbox from "@/components/shared/Form/FormCheckbox/FormCheckbox";
import { ImageBaseURL } from "@/features/utils/urls.utils";
import IssueAgendaAddModal from "./issueAgendaAddModal";

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
  follow?: boolean;
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
  follow,
  joiners,
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
    handleCheckIn,
    handleAddAgendaModal,
    addIssueModal,
    setAddIssueModal,
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
    return `${hours.toString().padStart(2, "0")}h:${minutes.toString().padStart(2, "0")}m`;
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
      title: "ALLOCATE TIME FOR ADDITIONAL",
      description: "Allow a few minutes at the end",
    },
  ];

  return (
    <div>
      <IssueModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        issue={modalIssue}
        defaultType=""
        onSubmit={handleModalSubmit}
      />
      <IssueAgendaAddModal
        isModalOpen={addIssueModal}
        modalClose={() => setAddIssueModal(false)}
        onSubmit={handleModalSubmit}
        isLoading={isPending}
        issueInput={issueInput}
        setIssueInput={setIssueInput}
        setDropdownVisible={setDropdownVisible}
        handleAddIssue={handleAddIssue}
        dropdownVisible={dropdownVisible}
        filteredIssues={filteredIssues}
        searchOptions={searchOptions}
        handleUpdateSelectedObjective={handleUpdateSelectedObjective}
      />

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
        ) : meetingStatus === "DISCUSSION" ? (
          <div className="flex gap-4">
            <div className="hidden md:block w-[362px] text-gray-500  text-lg truncate">
              Meeting Agenda
            </div>
            <nav className="z-20 flex">
              <div className="mr-5 flex gap-3 items-center rounded-2xl px-1">
                <Button
                  className={`w-32 justify-start border border-b-0 shadow-border rounded-b-none hover:bg-white text-primary cursor-pointer flex items-center ${activeTab === "tasks" ? "bg-white h-[50px] -mb-[4px] shadow-none" : "bg-gray-200 h-12"}`}
                  onClick={() => {
                    handleTabChange("tasks");
                  }}
                >
                  <List className="h-5 w-5" />
                  <span className="ml-2">
                    Tasks {detailAgendaData?.noOfTasks}
                  </span>
                </Button>
                <Button
                  className={`w-32 justify-start border border-b-0 shadow-border rounded-b-none hover:bg-white text-primary cursor-pointer flex items-center ${activeTab === "projects" ? "bg-white h-[50px] -mb-[4px] shadow-none" : "bg-gray-200 h-12"}`}
                  onClick={() => {
                    handleTabChange("projects");
                  }}
                >
                  <CheckSquare className="h-5 w-5" />
                  <span className="ml-2">
                    Projects {detailAgendaData?.noOfProjects}
                  </span>
                </Button>
                <Button
                  className={`w-32 justify-start border border-b-0 shadow-border rounded-b-none hover:bg-white text-primary cursor-pointer flex items-center ${activeTab === "kpis" ? "bg-white h-[50px] -mb-[4px] shadow-none" : "bg-gray-200 h-12"}`}
                  onClick={() => {
                    handleTabChange("kpis");
                  }}
                >
                  <BarChart2 className="h-5 w-5" />
                  <span className="ml-2">
                    KPIs {detailAgendaData?.noOfKPIs}
                  </span>
                </Button>
              </div>
            </nav>
          </div>
        ) : (
          <div className="flex gap-4 items-center flex-wrap">
            <div className="hidden md:block w-[330px] text-gray-500  text-lg truncate">
              Meeting Agenda
            </div>
            <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="font-medium text-sm">Agenda Actual:</span>
              <span className="font-bold">
                {formatTime(Number(conclusionData?.agendaActual))}m
              </span>
            </div>

            <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="font-medium text-sm">Discussion Actual:</span>
              <span className="font-bold">
                {formatTime(Number(conclusionData?.agendaTotalActual))}m
              </span>
            </div>

            {conclusionData?.conclusionActual != null && (
              <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="font-medium text-sm">Conclusion Actual:</span>
                <span className="font-bold">
                  {formatTime(Number(conclusionData.conclusionActual))}m
                </span>
              </div>
            )}

            {conclusionData?.meetingPlanned != null && (
              <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="font-medium text-sm">Meeting Planned:</span>
                <span className="font-bold">
                  {formatSecondsToHHMM(Number(conclusionData.meetingPlanned))}
                </span>
              </div>
            )}

            {conclusionData?.meetingActual != null &&
              conclusionData?.meetingActual != "0" && (
                <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-sm">Meeting Actual:</span>
                  <span className="font-bold">
                    {formatSecondsToHHMM(Number(conclusionData.meetingActual))}
                  </span>
                </div>
              )}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 border px-3 py-1 rounded-lg bg-primary text-white">
                <span className="font-medium text-sm">Total Tasks:</span>
                <span className="font-bold">{conclusionData?.noOfTasks}</span>
              </div>
              <div className="flex items-center gap-2 border px-3 py-1 rounded-lg bg-primary text-white">
                <span className="font-medium text-sm">Total Projects:</span>
                <span className="font-bold">
                  {conclusionData?.noOfProjects}
                </span>
              </div>
              <div className="flex items-center gap-2 border px-3 py-1 rounded-lg bg-primary text-white">
                <span className="font-medium text-sm">Total KPIs:</span>
                <span className="font-bold">{conclusionData?.noOfKPIs}</span>
              </div>
            </div>
          </div>
        )}
        {meetingStatus !== "ENDED" && (
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:w-auto">
            {meetingStatus === "NOT_STARTED" && isTeamLeader && (
              <Button
                variant="outline"
                className="w-[200px] h-[40px] bg-primary hover:bg-primary hover:text-white text-white rounded-[10px] cursor-pointer text-lg font-semibold flex items-center justify-center gap-2"
                onClick={handleStartMeeting}
                isLoading={isPending}
              >
                Start Meeting
              </Button>
            )}

            {meetingStatus === "NOT_STARTED" ||
              ((!isTeamLeader || !follow) && (
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

            {isTeamLeader && isCheckIn && follow && (
              <>
                {meetingStatus === "STARTED" && (
                  <Button
                    variant="outline"
                    className="w-[200px] h-[40px] bg-primary hover:bg-primary hover:text-white text-white rounded-[10px] cursor-pointer text-lg font-semibold"
                    onClick={handleDesc}
                    isLoading={isPending}
                  >
                    Start Discussion
                  </Button>
                )}
                {meetingStatus === "DISCUSSION" && (
                  <Button
                    variant="outline"
                    className="w-[180px] h-[40px] bg-primary hover:bg-primary hover:text-white text-white rounded-[10px] cursor-pointer text-lg font-semibold"
                    onClick={handleConclusionMeeting}
                  >
                    Go To Conclusion
                  </Button>
                )}
                {meetingStatus === "CONCLUSION" && (
                  <Button
                    variant="outline"
                    className="bg-primary text-white cursor-pointer px-4 hover:bg-primary py-5 text-sm hover:text-white sm:text-base md:text-lg"
                    onClick={handleCloseMeetingWithLog}
                    isLoading={endMeetingLoading}
                  >
                    End Meeting
                  </Button>
                )}
              </>
            )}

            {meetingStatus !== "ENDED" && (
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
                  isEditMode={meetingStatus === "NOT_STARTED" && isTeamLeader}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <div
          className={cn(
            // "ease-out duration-1000",
            isSideBar
              ? "w-[370px] min-w-[370px] ease-out duration-1000"
              : "w-[65%]",
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
          <div className="relative">
            <div className="mt-2 h-[calc(100vh-215px)] pr-1 w-full overflow-auto">
              {agendaList && agendaList.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {agendaList.map((item, idx) => (
                    <li
                      key={item.issueObjectiveId}
                      className={`group px-2 flex w-full 
                ${meetingStatus === "STARTED" || meetingStatus === "NOT_STARTED" ? "h-14" : "h-20"}
                ${isSelectedAgenda === item.detailMeetingAgendaIssueId ? "bg-primary text-white" : ""}
                mb-2 rounded-md shadow
                ${meetingStatus === "STARTED" || meetingStatus === "NOT_STARTED" ? "cursor-pointer" : ""}`}
                      draggable={
                        meetingStatus === "STARTED" ||
                        meetingStatus === "NOT_STARTED"
                      }
                      onDragStart={() => {
                        if (
                          meetingStatus === "STARTED" ||
                          meetingStatus === "NOT_STARTED"
                        ) {
                          handleDragStart(idx);
                        }
                      }}
                      onDragOver={(e) => {
                        if (
                          meetingStatus === "STARTED" ||
                          meetingStatus === "NOT_STARTED"
                        ) {
                          handleDragOver(e, idx);
                        }
                      }}
                      onDragLeave={() => {
                        if (
                          meetingStatus === "STARTED" ||
                          meetingStatus === "NOT_STARTED"
                        ) {
                          handleDragLeave();
                        }
                      }}
                      onDrop={() => {
                        if (
                          meetingStatus === "STARTED" ||
                          meetingStatus === "NOT_STARTED"
                        ) {
                          handleDrop(idx);
                        }
                      }}
                      onClick={() => {
                        if (
                          meetingStatus !== "STARTED" &&
                          meetingStatus !== "NOT_STARTED"
                        ) {
                          handleListClick(
                            item.detailMeetingAgendaIssueId ?? "",
                          );
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
                      <div className="flex items-center w-full">
                        {(meetingStatus === "STARTED" ||
                          meetingStatus === "NOT_STARTED") && (
                          <span
                            style={{ cursor: "grab" }}
                            className="w-5 flex-shrink-0"
                          >
                            ⋮⋮
                          </span>
                        )}

                        <span
                          className={`w-10 mr-3 text-4xl text-primary text-center ${isSelectedAgenda === item.detailMeetingAgendaIssueId ? "bg-primary text-white" : "text-primary"}`}
                        >
                          {idx + 1}
                        </span>

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
                                autoFocus
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
                          <div className="w-full flex items-center">
                            <div
                              className={`text-sm ${
                                meetingStatus === "STARTED" ||
                                meetingStatus === "NOT_STARTED"
                                  ? "w-full pr-8 h-14 flex items-center"
                                  : "w-full min-w-52"
                              } overflow-hidden line-clamp-3`}
                            >
                              {item.name}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 relative">
                        <div className="text-xs text-center w-20 text-gray-500 absolute top-0 right-0">
                          <Badge variant="secondary" className="mb-1.5">
                            {item.agendaType}
                          </Badge>
                        </div>

                        {(meetingStatus === "STARTED" ||
                          meetingStatus === "NOT_STARTED") &&
                          canEdit && (
                            <div className="flex-shrink-0 opacity-0 z-30 pl-5 bg-white w-20 text-left group-hover:opacity-100 transition-opacity">
                              {!(
                                editing.type === item.agendaType &&
                                editing.id === item.issueObjectiveId
                              ) && (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEdit(
                                        item.agendaType === "objective"
                                          ? "objective"
                                          : "issue",
                                        item.issueObjectiveId,
                                        item.name,
                                        item.plannedTime || "0",
                                        String(item.detailMeetingAgendaIssueId),
                                      );
                                    }}
                                    className="w-5"
                                  >
                                    <SquarePen className="h-4 w-4 text-primary" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(item);
                                    }}
                                    className="w-5"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}

                        {meetingStatus !== "STARTED" &&
                          meetingStatus !== "NOT_STARTED" &&
                          item.detailMeetingAgendaIssueId && (
                            <div className="text-sm text-center ml-2 font-medium text-primary">
                              <div className="text-xs text-center w-20 text-gray-500">
                                <Badge variant="secondary" className="mb-1.5">
                                  {item.agendaType}
                                </Badge>
                              </div>
                              {meetingStatus === "DISCUSSION" ? (
                                <Timer
                                  actualTime={Number(
                                    meetingResponse &&
                                      meetingResponse?.timers.objectives?.[
                                        item.detailMeetingAgendaIssueId
                                      ]?.actualTime,
                                  )}
                                  defaultTime={Number(
                                    meetingResponse &&
                                      meetingResponse?.timers.objectives?.[
                                        item.detailMeetingAgendaIssueId
                                      ]?.actualTime,
                                  )}
                                  lastSwitchTimestamp={
                                    isSelectedAgenda ===
                                    item.detailMeetingAgendaIssueId
                                      ? Number(
                                          meetingResponse?.state
                                            .lastSwitchTimestamp || Date.now(),
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
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No issues added</p>
              )}
              {meetingStatus === "DISCUSSION" && (
                <div
                  className="absolute bottom-0 right-0 border rounded-full p-2 bg-white shadow-2xl shadow-primary border-primary"
                  onClick={handleAddAgendaModal}
                >
                  <Plus />
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          style={{ width: contentWidth }}
          className={`${meetingStatus !== "DISCUSSION" && "mt-6"}`}
        >
          {/* <div className="flex gap-3 mb-4">
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
                          Number(conclusionData.meetingPlanned)
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
                            Number(conclusionData.meetingActual)
                          )}
                        </span>
                      </div>
                    )}
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 border px-3 py-1 rounded-lg bg-primary text-white">
                      <span className="font-medium text-sm">Total Tasks:</span>
                      <span className="font-bold">
                        {conclusionData?.noOfTasks}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 border px-3 py-1 rounded-lg bg-primary text-white">
                      <span className="font-medium text-sm">
                        Total Projects:
                      </span>
                      <span className="font-bold">
                        {conclusionData?.noOfProjects}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 border px-3 py-1 rounded-lg bg-primary text-white">
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
              <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-[30%] md:w-auto">
                {meetingStatus === "NOT_STARTED" && isTeamLeader && (
                  <Button
                    variant="outline"
                    className="w-[200px] h-[40px] bg-primary hover:bg-primary hover:text-white text-white rounded-[10px] cursor-pointer text-lg font-semibold flex items-center justify-center gap-2"
                    onClick={handleStartMeeting}
                    isLoading={isPending}
                  >
                    Start Meeting
                  </Button>
                )}

                {meetingStatus === "NOT_STARTED" ||
                  ((!isTeamLeader || !follow) && (
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

                {isTeamLeader && isCheckIn && follow && (
                  <>
                    {meetingStatus === "STARTED" && (
                      <Button
                        variant="outline"
                        className="w-[200px] h-[40px] bg-primary hover:bg-primary hover:text-white text-white rounded-[10px] cursor-pointer text-lg font-semibold"
                        onClick={handleDesc}
                        isLoading={isPending}
                      >
                        Start Discussion
                      </Button>
                    )}
                    {meetingStatus === "DISCUSSION" && (
                      <Button
                        variant="outline"
                        className="w-[200px] h-[40px] bg-primary hover:bg-primary hover:text-white text-white rounded-[10px] cursor-pointer text-lg font-semibold"
                        onClick={handleConclusionMeeting}
                      >
                        Go To Conclusion
                      </Button>
                    )}
                    {meetingStatus === "CONCLUSION" && (
                      <Button
                        variant="outline"
                        className="bg-primary text-white px-4 hover:bg-primary py-5 text-sm hover:text-white sm:text-base md:text-lg"
                        onClick={handleCloseMeetingWithLog}
                        isLoading={endMeetingLoading}
                      >
                        End Meeting
                      </Button>
                    )}
                  </>
                )}

                {meetingStatus !== "ENDED" && (
                  <div className="w-fit px-2 pl-4 h-[40px] border-gray-300 rounded-[10px] flex items-center justify-center">
                    <MeetingTimer
                      meetingTime={Number(meetingTime)}
                      actualTime={0}
                      lastSwitchTimestamp={Number(
                        meetingResponse?.state.meetingTimestamp
                      )}
                      meetingStart={meetingStatus !== "NOT_STARTED"}
                      className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary"
                      onTimeUpdate={handleTimeUpdate}
                      isEditMode={
                        meetingStatus === "NOT_STARTED" && isTeamLeader
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </div> */}
          <div className="border rounded-md flex justify-center w-full h-[calc(100vh-200px)] overflow-scroll">
            {meetingStatus === "NOT_STARTED" ? (
              <div className="max-w-3xl">
                <div className="bg-white rounded-lg shadow-lg p-6">
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

                  {/* Tips List */}
                  <div className="space-y-6">
                    {tips.map((tip, index) => (
                      <div key={index} className="flex items-start space-x-6">
                        {/* Icon Container */}
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
            ) : meetingStatus === "STARTED" ? (
              <div className="flex gap-6 text-center mt-48">
                {joiners &&
                  joiners.map((item) => {
                    return (
                      <div
                        key={item.employeeId}
                        className="flex flex-col w-full items-center"
                      >
                        <div className="relative">
                          {item.isTeamLeader && (
                            <span className="absolute -top-4 right-2 z-10 bg-white shadow-2xl rounded-full p-0.5">
                              <Crown className="w-5 h-5 text-[#303290] drop-shadow" />
                            </span>
                          )}
                          <div className="w-10 h-10 rounded-lg overflow-hidden">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  {item.employeeImage !== null ? (
                                    <img
                                      src={`${ImageBaseURL}/share/company/profilePics/${item.employeeImage}`}
                                      alt={item.employeeName}
                                      className="w-full h-full rounded-md object-cover outline-2 outline-blue-400 bg-black"
                                    />
                                  ) : (
                                    <div className="bg-gray-300 text-gray-700 w-full h-full content-center font-semibold text-sm">
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
                        </div>

                        <div className="text-sm font-medium text-gray-800 mt-2">
                          {item.employeeName}
                        </div>
                        <div>
                          <FormCheckbox
                            id={`${item.employeeId}-checkbox`}
                            className="w-[16px] h-[16px]"
                            containerClass="p-0 ml-1"
                            checked={item.attendanceMark}
                            onChange={(e) => {
                              const updatedAttendance = e.target.checked;
                              handleCheckIn(item, updatedAttendance);
                            }}
                            disabled={!isTeamLeader}
                          />
                        </div>
                      </div>
                    );
                  })}
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
              <div className="flex-1 h-[calc(100vh-230px)] overflow-x-scroll w-full">
                <div>
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
                          <div>
                            <div className="bg-primary text-white p-2 px-4">
                              <p>Task Name</p>
                            </div>
                            <div className="my-2">
                              {selectedItem?.discussion.taskUpdate.map(
                                (task, idx) => {
                                  // Get all possible keys from both old and new values
                                  const allKeys = [
                                    ...new Set([
                                      ...Object.keys(task.oldValues),
                                      ...Object.keys(task.newValues),
                                    ]),
                                  ] as Array<keyof typeof task.oldValues>;

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
                                          )}
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
                                },
                              )}
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
                              {selectedItem?.discussion.projectUpdate.map(
                                (project, idx) => {
                                  const allKeys = [
                                    ...new Set([
                                      ...Object.keys(project.oldValues),
                                      ...Object.keys(project.newValues),
                                    ]),
                                  ] as Array<keyof typeof project.oldValues>;

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
                                },
                              )}
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
                              {selectedItem?.discussion.kpiUpdate.map(
                                (kpi: KpiUpdate, idx: number) => {
                                  const allKeys = [
                                    ...new Set([
                                      ...Object.keys(kpi.oldValues),
                                      ...Object.keys(kpi.newValues),
                                    ]),
                                  ] as Array<keyof typeof kpi.oldValues>;

                                  return (
                                    <div
                                      key={idx}
                                      className="flex overflow-hidden border-b py-2"
                                    >
                                      <div className="w-1/3 pl-4">
                                        <h4 className="font-medium text-gray-800">
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
                                        </h4>
                                      </div>
                                      <div className="w-2/3">
                                        <div className="space-y-1">
                                          {allKeys.map((key) => {
                                            const oldValue = kpi.oldValues[key];
                                            const newValue = kpi.newValues[key];

                                            // Skip if values are the same
                                            if (oldValue === newValue)
                                              return null;

                                            return (
                                              <div
                                                key={String(key)}
                                                className="text-sm"
                                              >
                                                <span className="font-medium text-gray-600 capitalize">
                                                  {key
                                                    .toString()
                                                    .replace("kpi", "")
                                                    .replace(/([A-Z])/g, " $1")
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
                                          })}

                                          {kpi.newData &&
                                            kpi.newData.length > 0 && (
                                              <div className="mt-2">
                                                <div className="mt-1 space-y-2">
                                                  {kpi.newData.map(
                                                    (
                                                      newDataItem: KpiRecordedData,
                                                      dataIdx: number,
                                                    ) => {
                                                      const oldDataItem = kpi
                                                        .oldData?.[dataIdx] || {
                                                        data: null,
                                                      };
                                                      return (
                                                        <div
                                                          key={dataIdx}
                                                          className="text-sm"
                                                        >
                                                          <span className="font-medium text-gray-600">
                                                            {formatDate(
                                                              newDataItem.startDate,
                                                            )}
                                                            :
                                                          </span>{" "}
                                                          <span className="text-red-500 line-through">
                                                            {oldDataItem.data ||
                                                              "N/A"}
                                                          </span>
                                                          <span className="mx-2 text-gray-400">
                                                            →
                                                          </span>
                                                          <span className="text-green-600">
                                                            {newDataItem.data ||
                                                              "N/A"}
                                                          </span>
                                                        </div>
                                                      );
                                                    },
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                },
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
