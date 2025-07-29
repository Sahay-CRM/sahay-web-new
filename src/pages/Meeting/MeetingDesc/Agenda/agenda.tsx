import { useState } from "react";

import {
  BarChart2,
  CheckSquare,
  CircleX,
  CornerDownLeft,
  List,
  SquarePen,
  Trash2,
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
  handleStartMeeting: () => void;
  joiners: Joiners[];
  isPending: boolean;
  meetingTime?: string;
  currentIssueObjId?: string;
}

export default function Agenda({
  meetingName,
  meetingId,
  meetingStatus,
  meetingResponse,
  detailMeetingId,
  handleStartMeeting,
  isPending,
  meetingTime,
  currentIssueObjId,
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
  } = useAgenda({
    meetingId,
    meetingStatus,
    meetingResponse,
    detailMeetingId,
    canEdit: true,
    currentIssueObjId,
  });

  const canEdit = true;

  return (
    <div>
      <IssueModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        issue={modalIssue}
        defaultType=""
        onSubmit={handleModalSubmit}
      />
      <div className="flex gap-3">
        <div
          className={cn(
            "transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.5,1)]",
            isSideBar ? "w-[450px]" : "w-[65%]",
          )}
        >
          {!isSideBar && canEdit && (
            <div className="flex gap-2 relative">
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
            </div>
          )}
          <div className="mt-2 h-[calc(100vh-200px)] pr-1 w-full overflow-auto">
            {agendaList && agendaList.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {agendaList.map((item, idx) => (
                  <li
                    key={item.issueObjectiveId}
                    className={`group px-2 h-20 flex w-full ${
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
                    <div className="flex items-center">
                      {(meetingStatus === "STARTED" ||
                        meetingStatus === "NOT_STARTED") && (
                        <span style={{ marginRight: 8, cursor: "grab" }}>
                          ⋮⋮
                        </span>
                      )}
                      {editing.type === item.agendaType &&
                      editing.id === item.issueObjectiveId &&
                      canEdit ? null : (
                        <div className="">
                          <div className="text-sm w-[75%] overflow-hidden text-ellipsis line-clamp-3 ml-2">
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
                                  <Timer
                                    actualTime={Number(
                                      meetingResponse?.timers.objectives?.[
                                        item.detailMeetingAgendaIssueId ?? ""
                                      ]?.actualTime || 0,
                                    )}
                                    defaultTime={Number(
                                      meetingResponse?.timers.objectives?.[
                                        item.detailMeetingAgendaIssueId ?? ""
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
                                    className={`${
                                      isSelectedAgenda ===
                                      item.detailMeetingAgendaIssueId
                                        ? "text-white"
                                        : ""
                                    }`}
                                  />
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
        <div className="w-full">
          <div className="flex gap-3 mb-4">
            <div className="w-full">
              {meetingStatus === "STARTED" ||
              meetingStatus === "NOT_STARTED" ? (
                <div className="w-full flex h-[40px] border border-gray-300 rounded-[10px] items-center px-4">
                  <div className="flex-1 text-lg w-[30%] text-primary ml-3 font-semibold truncate">
                    {meetingName}
                  </div>

                  <div className="hidden md:block w-[50%] text-gray-500  text-lg truncate ml-4">
                    Meeting Agenda
                  </div>
                </div>
              ) : (
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
              )}
            </div>
            <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-[30%] md:w-auto">
              {meetingStatus === "NOT_STARTED" && (
                <Button
                  variant="outline"
                  className="w-full sm:w-[200px] h-[40px] bg-primary text-white rounded-[10px] cursor-pointer text-lg font-semibold flex items-center justify-center gap-2"
                  onClick={handleStartMeeting}
                  isLoading={isPending}
                >
                  Start Meeting
                </Button>
              )}

              {meetingStatus === "STARTED" && (
                <Button
                  variant="outline"
                  className="w-full sm:w-[200px] h-[40px] bg-primary text-white rounded-[10px] cursor-pointer text-lg font-semibold"
                  onClick={handleDesc}
                  disabled={isPending || agendaList.length === 0} // Disable if empty
                >
                  {isPending ? "Loading..." : "Start Discussion"}
                </Button>
              )}

              {meetingStatus === "DISCUSSION" && (
                <Button
                  variant="outline"
                  className="bg-primary text-white px-4 py-5 text-sm sm:text-base md:text-lg"
                  onClick={handleConclusionMeeting}
                >
                  Go To Conclusion
                </Button>
              )}

              {/* Timer */}
              <div className="w-fit px-2 pl-4 h-[40px] border-gray-300 rounded-[10px] flex items-center justify-center">
                <MeetingTimer
                  meetingTime={Number(meetingTime)}
                  actualTime={0}
                  lastSwitchTimestamp={Number(
                    meetingResponse?.state.meetingTimestamp,
                  )}
                  meetingStart={meetingStatus !== "NOT_STARTED"}
                  className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary"
                  onTimeUpdate={handleTimeUpdate}
                />
              </div>
            </div>
          </div>
          <div className="border rounded-md flex items-center justify-center w-full h-[calc(100vh-200px)] overflow-scroll">
            {meetingStatus === "STARTED" || meetingStatus === "NOT_STARTED" ? (
              <div className="w-[400px]">
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
            ) : (
              detailAgendaData && (
                <div className="h-full mt-8">
                  {activeTab === "tasks" && (
                    <Tasks
                      tasksFireBase={tasksFireBase}
                      meetingAgendaIssueId={isSelectedAgenda}
                      detailMeetingId={detailMeetingId}
                    />
                  )}
                  {activeTab === "projects" && (
                    <div>
                      <div className="overflow-x-auto ">
                        <Projects
                          meetingId={meetingId}
                          projectsFireBase={projectsFireBase}
                          meetingAgendaIssueId={isSelectedAgenda}
                          detailMeetingId={detailMeetingId}
                        />
                      </div>
                    </div>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
