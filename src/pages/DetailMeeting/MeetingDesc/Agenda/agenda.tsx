import React, { Suspense, useEffect, useState } from "react";

import {
  ArrowUp,
  BarChart2,
  Bell,
  Calendar,
  CheckSquare,
  Clock,
  CornerDownLeft,
  Crown,
  FileText,
  List,
  Plus,
  Target,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import MeetingTimer from "../meetingTimer";
import { cn } from "@/lib/utils";
import { useAgenda } from "./useAgenda";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  closestCenter,
  DndContext,
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
  joiners: Joiners[];
  meetingTime?: string;
  isTeamLeader: boolean | undefined;
  follow?: boolean;
  isBellRing?: () => void;
}

export default function Agenda({
  meetingName,
  meetingId,
  meetingStatus,
  meetingResponse,
  meetingTime,
  isTeamLeader,
  follow,
  joiners,
  isBellRing,
}: AgendaProps) {
  const {
    issueInput,
    editing,
    modalOpen,
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
    handleStartMeeting,
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
  } = useAgenda({
    meetingId,
    meetingStatus,
    meetingResponse,
    canEdit: true,
    joiners,
    isTeamLeader,
    follow,
  });

  const unresolvedCount = agendaList?.filter(
    (item) => item.type === "UNRESOLVED",
  ).length;

  const resolvedCount = agendaList?.filter(
    (item) => item.type === "RESOLVED",
  ).length;

  const parkedCount = agendaList?.filter(
    (item) => item.type === "PARKED",
  ).length;

  const [contentWidth, setContentWidth] = useState("90%");
  const sensors = useSensors(useSensor(PointerSensor));

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
                    <div className="flex items-center gap-2 border px-3 py-1 rounded-lg bg-primary text-white">
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
                    </div>
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
                  (!isTeamLeader && (
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

                {isTeamLeader && (
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
                      isEditMode={
                        meetingStatus === "NOT_STARTED" && isTeamLeader
                      }
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
              : "w-[65%]",
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
            <div className="mb-3">
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
                className="w-full"
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
            </div>
            <div className="mt-1 h-[calc(100vh-260px)] pr-1 w-full overflow-auto">
              {agendaList && agendaList.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={agendaList.map((i) => i.issueObjectiveId)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {agendaList &&
                        agendaList
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
                              isTeamLeader={isTeamLeader}
                              isUnFollow={unFollowByUser}
                              meetingTime={meetingTime}
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
          className={`${meetingStatus !== "DISCUSSION" && ""}`}
        >
          <div className="flex justify-between">
            {meetingStatus === "DISCUSSION" && (
              <div className="w-full">
                <div className="flex gap-4">
                  <nav className="z-20 flex">
                    <div className="mr-5 flex gap-3 items-center rounded-2xl ">
                      {/* KPIs */}
                      <Button
                        className={`w-32 mx-auto border border-b-0 rounded-b-none hover:bg-white cursor-pointer flex items-center ${
                          activeTab === "kpis"
                            ? "bg-white h-[50px] border-t-4 border-l-1 border-r-1 border-primary z-10"
                            : "bg-gray-100 h-12"
                        }`}
                        style={
                          activeTab === "kpis"
                            ? { marginBottom: "-2px", color: "#2f318e" }
                            : { marginBottom: "1px", color: "gray" }
                        }
                        onClick={() => {
                          if (follow || unFollowByUser) handleTabChange("kpis");
                        }}
                      >
                        <BarChart2 className="h-5 w-5" />
                        <span>KPIs ({detailAgendaData?.noOfKPIs})</span>
                      </Button>

                      {/* Projects */}
                      <Button
                        className={`w-32 mx-auto border border-b-0 shadow-border rounded-b-none hover:bg-white cursor-pointer flex items-center ${
                          activeTab === "projects"
                            ? "bg-white h-[50px] shadow-none border-t-4 border-l-1 border-r-1 border-primary z-10"
                            : "bg-gray-100 h-12"
                        }`}
                        style={
                          activeTab === "projects"
                            ? { marginBottom: "-2px", color: "#2f318e" }
                            : { marginBottom: "1px", color: "gray" }
                        }
                        onClick={() => {
                          if (follow || unFollowByUser)
                            handleTabChange("projects");
                        }}
                      >
                        <CheckSquare className="h-5 w-5" />
                        <span>Projects ({detailAgendaData?.noOfProjects})</span>
                      </Button>

                      {/* Tasks */}
                      <Button
                        className={`w-32 mx-auto border border-b-0 shadow-border rounded-b-none hover:bg-white cursor-pointer flex items-center ${
                          activeTab === "tasks"
                            ? "bg-white h-[50px] shadow-none border-t-4 border-l-1 border-r-1 border-primary z-10"
                            : "bg-gray-100 h-12"
                        }`}
                        style={
                          activeTab === "tasks"
                            ? { marginBottom: "-2px", color: "#2f318e" }
                            : { marginBottom: "1px", color: "gray" }
                        }
                        onClick={() => {
                          if (follow || unFollowByUser)
                            handleTabChange("tasks");
                        }}
                      >
                        <List className="h-5 w-5" />
                        <span>Tasks ({detailAgendaData?.noOfTasks})</span>
                      </Button>
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
                  <div className="flex items-center gap-2 border px-3 py-1 rounded-lg bg-primary text-white">
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
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:w-auto">
              {isTeamLeader && (
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
                        onClick={handleConclusionMeeting}
                      >
                        Go To Conclusion
                      </Button>
                    </>
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
                      isEditMode={
                        meetingStatus === "NOT_STARTED" && isTeamLeader
                      }
                      meetingStatus={meetingStatus}
                      isUpdating={isUpdatingTime}
                    />
                  </div>
                )}
            </div>
          </div>
          <div
            className={`
    flex justify-center w-full h-[calc(100vh-210px)] relative border-primary

    ${
      meetingStatus === "DISCUSSION" &&
      " border-l-1 border-r-1 border-b-1 rounded-tr-[10px] rounded-bl-[10px] rounded-br-[10px]"
    }

    ${meetingStatus === "CONCLUSION" && "h-[calc(100vh-220px)]"}

    ${meetingStatus !== "DISCUSSION" && "p-4"}

    ${(meetingStatus === "CONCLUSION" || meetingStatus === "ENDED") && "border"}
  `}
          >
            {meetingStatus === "DISCUSSION" && (
              <div className="absolute top-0 left-0 right-1 h-0.5 flex">
                <div
                  className="border-t-1 border-primary h-0"
                  style={{
                    width:
                      activeTab === "tasks"
                        ? "280px"
                        : activeTab === "projects"
                          ? "140px"
                          : activeTab === "kpis"
                            ? "0px"
                            : "0px",
                  }}
                />
                <div style={{ width: "124px" }} />
                <div className="border-t-1 border-primary h-0 flex-1" />
              </div>
            )}
            {meetingStatus === "NOT_STARTED" ? (
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
            ) : meetingStatus === "STARTED" ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-wrap gap-8 text-center justify-center">
                  {joiners &&
                    joiners.map((item) => {
                      return (
                        <div
                          key={item.employeeId}
                          className="flex items-center"
                        >
                          <div className="flex gap-2 w-40">
                            <div className="relative">
                              {item.isTeamLeader && (
                                <span className="absolute -top-2 right-3 z-10 bg-white shadow-2xl rounded-full p-0.5">
                                  <Crown className="w-3 h-3 text-[#303290] drop-shadow" />
                                </span>
                              )}
                              <div className="w-10 h-10 rounded-full overflow-hidden">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      {item.employeeImage !== null ? (
                                        <img
                                          src={`${ImageBaseURL}/share/company/profilePics/${item.employeeImage}`}
                                          alt={item.employeeName}
                                          className="w-full h-full object-cover outline-2 outline-blue-400 bg-black"
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
                              <div>
                                <FormCheckbox
                                  id={`${item.employeeId}-checkbox`}
                                  className="w-[15px] h-[15px]"
                                  containerClass="p-0 ml-3"
                                  checked={item.attendanceMark}
                                  onChange={(e) => {
                                    const updatedAttendance = e.target.checked;
                                    handleCheckIn(item, updatedAttendance);
                                  }}
                                  disabled={!isTeamLeader}
                                />
                              </div>
                            </div>

                            <div className="text-sm font-medium text-gray-800 mt-2">
                              {item.employeeName}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : meetingStatus === "DISCUSSION" ? (
              detailAgendaData && (
                <div className="max-h-full h-[calc(100vh-200px)] overflow-scroll mt-5 px-2 w-full">
                  <Suspense fallback={<div>Loading...</div>}>
                    {activeTab === "tasks" && (
                      <Tasks
                        tasksFireBase={tasksFireBase}
                        issueId={
                          ioType === "ISSUE"
                            ? agendaList?.find(
                                (Item) =>
                                  Item.issueObjectiveId === isSelectedAgenda,
                              )?.issueId
                            : agendaList?.find(
                                (obj) =>
                                  obj.issueObjectiveId === isSelectedAgenda,
                              )?.objectiveId
                        }
                        ioType={ioType}
                        selectedIssueId={isSelectedAgenda}
                        isTeamLeader={isTeamLeader}
                      />
                    )}
                    {activeTab === "projects" && (
                      <Projects
                        projectsFireBase={projectsFireBase}
                        issueId={
                          ioType === "ISSUE"
                            ? agendaList?.find(
                                (Item) =>
                                  Item.issueObjectiveId === isSelectedAgenda,
                              )?.issueId
                            : agendaList?.find(
                                (obj) =>
                                  obj.issueObjectiveId === isSelectedAgenda,
                              )?.objectiveId
                        }
                        ioType={ioType}
                        selectedIssueId={isSelectedAgenda}
                        isTeamLeader={isTeamLeader}
                      />
                    )}
                    {activeTab === "kpis" && (
                      <KPITable
                        meetingId={meetingId}
                        kpisFireBase={kpisFireBase}
                        ioId={
                          ioType === "ISSUE"
                            ? agendaList?.find(
                                (Item) =>
                                  Item.issueObjectiveId === isSelectedAgenda,
                              )?.issueId
                            : agendaList?.find(
                                (obj) =>
                                  obj.issueObjectiveId === isSelectedAgenda,
                              )?.objectiveId
                        }
                        ioType={ioType}
                        selectedIssueId={isSelectedAgenda}
                        isTeamLeader={isTeamLeader}
                        follow={follow}
                        meetingRes={meetingResponse!}
                      />
                    )}
                  </Suspense>
                </div>
              )
            ) : conclusionLoading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin">
                  <SpinnerIcon />
                </div>
              </div>
            ) : (
              <div className="flex-1 h-[calc(100vh-320px)] overflow-x-hidden overflow-y-auto w-full">
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
