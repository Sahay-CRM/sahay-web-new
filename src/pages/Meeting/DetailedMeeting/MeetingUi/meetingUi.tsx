import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import {
  ChevronRight,
  ChevronLeft,
  List,
  Calendar,
  Folder,
  CheckSquare,
  BarChart2,
  ClipboardCheck,
  Crown,
} from "lucide-react";
import Tasks from "./Tasks";
import Projects from "./Projects/projects";
import KPITable from "./KpiTable";
import useMeetingUi from "./useMeetingUi";
import Agenda from "./Agenda";

import userProfile from "@/assets/userDummy.jpg";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Timer from "./Timer";
import MeetingNotes from "./MeetingNotes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { StickyNote } from "lucide-react";

type ActiveTab =
  | "agenda"
  | "discussion"
  | "projects"
  | "tasks"
  | "kpis"
  | "conclusion";

interface MeetingUiProps {
  meetingStart: boolean;
  isTeamLeader: boolean;
  activeScreen?: string;
  meetingEnded?: boolean;
  onLogTabTimes?: (data: {
    defaultTimes: Record<string, number>;
    spentTimes: Record<string, number>;
  }) => void;
  onTabTimesChange?: (data: {
    defaultTimes: Record<string, number>;
    spentTimes: Record<string, number>;
  }) => void;
  meetingTiming?: {
    agendaTimePlanned?: string;
    discussionTaskTimePlanned?: string;
    discussionProjectTimePlanned?: string;
    discussionKPITimePlanned?: string;
    conclusionTimePlanned?: string;
    agendaTimeActual?: string;
    discussionTaskTimeActual?: string;
    discussionProjectTimeActual?: string;
    discussionKPITimeActual?: string;
    conclusionTimeActual?: string;
  };
  meetingJoiners?: Joiners[] | string[];
  handleStartMeeting: () => void;
  handleCloseMeetingWithLog: () => void;
}

export default function MeetingUI({
  meetingStart,
  isTeamLeader,
  onTabTimesChange,
  meetingTiming,
  meetingJoiners,
  handleStartMeeting,
  handleCloseMeetingWithLog,
}: MeetingUiProps) {
  const {
    tabChangeFireBase,
    meetingId,
    tasksFireBase,
    projectFireBase,
    kpisFireBase,
    timerMinutesMap,
    setTimerMinutesMap,
    userId,
    handleAddTeamLeader,
  } = useMeetingUi({
    meetingStart,
    isTeamLeader,
    meetingTiming,
    meetingJoiners,
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>("agenda");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setRightIsSidebarCollapsed] = useState(false);

  const isMeetingStarted = meetingStart === true;
  const safeMeetingId = meetingId ?? "";

  const [tabTimes, setTabTimes] = useState({
    agenda: 0,
    projects: 0,
    tasks: 0,
    kpis: 0,
    conclusion: 0,
  });

  const [checkedInMap, setCheckedInMap] = useState<{
    [employeeId: string]: boolean;
  }>({});

  const getInitialMinutes = useCallback(
    (tab: string) => {
      const stored = localStorage.getItem(
        `meeting-${safeMeetingId}-timer-${tab}`,
      );
      return stored ? parseInt(stored) : 1;
    },
    [safeMeetingId],
  );

  const getInitialSpent = useCallback(
    (tab: string) => {
      const stored = localStorage.getItem(
        `meeting-${safeMeetingId}-timer-spent-${tab}`,
      );
      return stored ? parseInt(stored) : 0;
    },
    [safeMeetingId],
  );

  // Reset timer data when meetingId changes
  useEffect(() => {
    const newTimerMinutesMap: Record<string, number> = {};
    const newTabTimes: Record<string, number> = {};

    ["agenda", "projects", "tasks", "kpis", "conclusion"].forEach((tab) => {
      newTimerMinutesMap[tab] = getInitialMinutes(tab);
      newTabTimes[tab] = getInitialSpent(tab);
    });

    setTimerMinutesMap(newTimerMinutesMap);
    // setTabTimes(newTabTimes);
  }, [getInitialMinutes, getInitialSpent, safeMeetingId, setTimerMinutesMap]);

  const handleTimeChange = (tab: string, minutes: number) => {
    setTimerMinutesMap((prev) => {
      const updated = { ...prev, [tab]: minutes };
      localStorage.setItem(
        `meeting-${safeMeetingId}-timer-${tab}`,
        String(minutes),
      );

      if (tab === "agenda") {
        const prevMinutes = prev[tab];
        const prevSpent = tabTimes[tab] || 0;
        const prevRemaining = prevMinutes * 60 - prevSpent;
        const newSpent = Math.max(0, minutes * 60 - prevRemaining);
        setTabTimes((prevTabTimes) => {
          const updatedTabTimes = { ...prevTabTimes, [tab]: newSpent };
          localStorage.setItem(
            `meeting-${safeMeetingId}-timer-spent-${tab}`,
            String(newSpent),
          );
          return updatedTabTimes;
        });
      }

      return updated;
    });
  };

  const handleTimeSpent = (tab: string, seconds: number) => {
    setTabTimes((prev) => {
      const updated = { ...prev, [tab]: seconds };
      localStorage.setItem(
        `meeting-${safeMeetingId}-timer-spent-${tab}`,
        String(seconds),
      );
      return updated;
    });
  };

  useEffect(() => {
    if (typeof onTabTimesChange === "function") {
      onTabTimesChange({
        defaultTimes: timerMinutesMap,
        spentTimes: tabTimes,
      });
    }
  }, [tabTimes, timerMinutesMap, onTabTimesChange]);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (isTeamLeader) {
      tabChangeFireBase(tab);
    }
  };

  const discussionAllocatedMinutes =
    (timerMinutesMap["tasks"] || 0) +
    (timerMinutesMap["projects"] || 0) +
    (timerMinutesMap["kpis"] || 0);
  const discussionAllocatedSeconds = discussionAllocatedMinutes * 60;

  const conclusionPlannedMinutes = meetingTiming?.conclusionTimePlanned
    ? Math.floor(Number(meetingTiming.conclusionTimePlanned) / 60)
    : undefined;

  const handleCheckIn = (employeeId: string) => {
    setCheckedInMap((prev) => ({ ...prev, [employeeId]: true }));
  };

  const handleCheckOut = (employeeId: string) => {
    setCheckedInMap((prev) => ({ ...prev, [employeeId]: false }));
  };

  const totalMinutes = meetingTiming
    ? (parseInt(meetingTiming.agendaTimePlanned ?? "0") +
        parseInt(meetingTiming.discussionTaskTimePlanned ?? "0") +
        parseInt(meetingTiming.discussionProjectTimePlanned ?? "0") +
        parseInt(meetingTiming.discussionKPITimePlanned ?? "0")) /
      60
    : 0;

  let meetingActionArea: React.ReactNode;
  if (isRightSidebarCollapsed) {
    meetingActionArea = (
      <div className="flex items-center justify-center w-full h-12 text-white font-semibold text-lg bg-[#303290] rounded-full">
        {totalMinutes} min
      </div>
    );
  } else {
    meetingActionArea = (
      <div className="flex items-center w-full">
        {Array.isArray(meetingJoiners) &&
        (meetingJoiners as Joiners[]).some(
          (joiner) => joiner.employeeId === userId && joiner.isTeamLeader,
        ) ? (
          meetingStart ? (
            <Button
              variant="outline"
              className="cursor-pointer w-full bg-red-800 text-white py-5 px-8 hover:bg-red-800/80 hover:text-white rounded-full text-lg font-semibold flex items-center justify-between"
              onClick={handleCloseMeetingWithLog}
            >
              <span>End Meeting</span>
              <span className="ml-4 text-base font-normal">
                {totalMinutes} min
              </span>
            </Button>
          ) : (
            <Button
              variant="outline"
              className="cursor-pointer w-full bg-[#303290] text-white py-5 px-8 hover:bg-[#303290]/80 hover:text-white rounded-full text-lg font-semibold flex items-center justify-between"
              onClick={handleStartMeeting}
            >
              <span>Start Meeting</span>
              <span className="ml-4 text-base font-normal">
                {totalMinutes} min
              </span>
            </Button>
          )
        ) : (
          <Button
            variant="outline"
            className="cursor-pointer w-full bg-blue-800 text-white py-5 px-8 hover:bg-blue-800/80 hover:text-white rounded-full text-lg font-semibold flex items-center justify-between"
          >
            <span>Join Meeting</span>
            <span className="ml-4 text-base font-normal">
              {totalMinutes} min
            </span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex h-[calc(100vh-150px)] relative">
        {/* Sidebar */}
        <div
          className={`${isSidebarCollapsed ? "w-16 ease-in-out duration-700" : "w-80 ease-in-out duration-700"} border rounded-2xl p-4 bg-gray-50 transition-all duration-300 relative overflow-hidden`}
        >
          <h1
            className={`text-xl font-bold mb-6 flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-start"}`}
          >
            {isSidebarCollapsed ? (
              <List className="h-5 w-5" />
            ) : (
              "Core Team Meeting"
            )}
          </h1>

          <nav className="space-y-1">
            <Button
              variant={activeTab === "agenda" ? "default" : "ghost"}
              className={`${isSidebarCollapsed ? "w-8 h-8 p-0 justify-center" : "w-full justify-start"} border cursor-pointer`}
              onClick={() => handleTabChange("agenda")}
            >
              {isSidebarCollapsed ? (
                <Calendar className="h-4 w-4" />
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Agenda
                  <Timer
                    initialMinutes={timerMinutesMap["agenda"]}
                    timeOverride={timerMinutesMap["agenda"]}
                    onTimeChange={(minutes) =>
                      handleTimeChange("agenda", minutes)
                    }
                    isActive={activeTab === "agenda" && isMeetingStarted}
                    className="ml-auto"
                    showEditButton={!isMeetingStarted}
                    meetingId={safeMeetingId}
                    tabName="agenda"
                    onTimeSpent={(seconds) =>
                      handleTimeSpent("agenda", seconds)
                    }
                  />
                </>
              )}
            </Button>

            <div className="space-y-1">
              <Button
                variant={
                  activeTab.startsWith("discussion") ||
                  ["projects", "tasks", "kpis"].includes(activeTab)
                    ? "default"
                    : "ghost"
                }
                className={`${isSidebarCollapsed ? "w-8 h-8 p-0 justify-center" : "w-full justify-between"} bg-gray-200 border my-2 `}
              >
                {isSidebarCollapsed ? (
                  <Folder className="h-4 w-4" />
                ) : (
                  <>
                    <div className="flex items-center text-black">
                      <Folder className="mr-2 h-4 w-4" />
                      Discussion
                    </div>
                    {!isSidebarCollapsed && (
                      <>
                        <Timer
                          timeOverride={discussionAllocatedSeconds}
                          readOnly={true}
                          className="ml-2"
                          showEditButton={false}
                          meetingId={safeMeetingId}
                          tabName="discussion"
                        />
                      </>
                    )}
                  </>
                )}
              </Button>

              {!isSidebarCollapsed && (
                <div className="ml-4 space-y-1 mt-1">
                  <Button
                    variant={activeTab === "projects" ? "default" : "ghost"}
                    className="w-full justify-start border cursor-pointer mb-2"
                    onClick={() => handleTabChange("projects")}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Projects
                    <Timer
                      initialMinutes={timerMinutesMap["projects"]}
                      onTimeChange={(minutes) =>
                        handleTimeChange("projects", minutes)
                      }
                      isActive={activeTab === "projects" && isMeetingStarted}
                      className="ml-auto"
                      showEditButton={!isMeetingStarted}
                      meetingId={safeMeetingId}
                      tabName="projects"
                      onTimeSpent={(seconds) =>
                        handleTimeSpent("projects", seconds)
                      }
                    />
                  </Button>
                  <Button
                    variant={activeTab === "tasks" ? "default" : "ghost"}
                    className="w-full justify-start border cursor-pointer mb-2"
                    onClick={() => handleTabChange("tasks")}
                  >
                    <List className="mr-2 h-4 w-4" />
                    Tasks
                    <Timer
                      initialMinutes={timerMinutesMap["tasks"]}
                      onTimeChange={(minutes) =>
                        handleTimeChange("tasks", minutes)
                      }
                      isActive={activeTab === "tasks" && isMeetingStarted}
                      className="ml-auto"
                      showEditButton={!isMeetingStarted}
                      meetingId={safeMeetingId}
                      tabName="tasks"
                      onTimeSpent={(seconds) =>
                        handleTimeSpent("tasks", seconds)
                      }
                    />
                  </Button>
                  <Button
                    variant={activeTab === "kpis" ? "default" : "ghost"}
                    className="w-full justify-start border cursor-pointer"
                    onClick={() => handleTabChange("kpis")}
                  >
                    <BarChart2 className="mr-2 h-4 w-4" />
                    KPIs
                    <Timer
                      initialMinutes={timerMinutesMap["kpis"]}
                      onTimeChange={(minutes) =>
                        handleTimeChange("kpis", minutes)
                      }
                      isActive={activeTab === "kpis" && isMeetingStarted}
                      className="ml-auto"
                      showEditButton={!isMeetingStarted}
                      meetingId={safeMeetingId}
                      tabName="kpis"
                      onTimeSpent={(seconds) =>
                        handleTimeSpent("kpis", seconds)
                      }
                    />
                  </Button>
                </div>
              )}
            </div>

            <Button
              variant={activeTab === "conclusion" ? "default" : "ghost"}
              className={`${isSidebarCollapsed ? "w-8 h-8 p-0 justify-center" : "w-full justify-start"} mt-2 border cursor-pointer `}
              onClick={() => handleTabChange("conclusion")}
            >
              {isSidebarCollapsed ? (
                <ClipboardCheck className="h-4 w-4" />
              ) : (
                <>
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Conclusion
                  {conclusionPlannedMinutes !== undefined && (
                    <span className="ml-auto text-sm">
                      ({conclusionPlannedMinutes} min)
                    </span>
                  )}
                </>
              )}
            </Button>
          </nav>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className=" z-10 -mx-4 rounded-full w-9 h-9 bg-white border shadow-sm"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-6 w-6" />
          ) : (
            <ChevronLeft className="h-6 w-6" />
          )}
        </Button>

        <div className="flex-1 px-7 overflow-auto">
          <Card className="h-full">
            {/* Agenda Content */}
            {activeTab === "agenda" && (
              <div>
                <CardHeader>
                  <CardTitle>Agenda</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Agenda
                      meetingId={safeMeetingId}
                      meetingStart={meetingStart}
                      isTeamLeader={isTeamLeader}
                    />
                  </div>
                </CardContent>
              </div>
            )}

            {/* Projects Content */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <Projects
                    meetingId={safeMeetingId}
                    projectFireBase={projectFireBase}
                  />
                </CardContent>
              </div>
            )}

            {/* Tasks Content */}
            {activeTab === "tasks" && (
              <div className="space-y-4">
                <CardHeader>
                  <CardTitle>Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tasks
                    meetingId={safeMeetingId}
                    tasksFireBase={tasksFireBase}
                  />
                </CardContent>
              </div>
            )}

            {/* KPIs Content */}
            {activeTab === "kpis" && (
              <div className="space-y-4">
                <CardHeader>
                  <CardTitle>KPIs</CardTitle>
                </CardHeader>
                <CardContent>
                  <KPITable
                    meetingId={safeMeetingId}
                    kpisFireBase={kpisFireBase}
                  />
                </CardContent>
              </div>
            )}

            {/* Conclusion Content */}
            {activeTab === "conclusion" && (
              <div>
                <CardHeader>
                  <CardTitle>Conclusion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-2 border-b">
                      <span>Summary of decisions</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border-b">
                      <span>Action items</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border-b">
                      <span>Next steps</span>
                    </div>
                  </div>
                </CardContent>
              </div>
            )}
          </Card>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className=" z-10 -mx-4  rounded-full w-9 h-9 bg-white border shadow-sm"
          onClick={() => setRightIsSidebarCollapsed(!isRightSidebarCollapsed)}
        >
          {isRightSidebarCollapsed ? (
            <ChevronRight className="h-6 w-6" />
          ) : (
            <ChevronLeft className="h-6 w-6" />
          )}
        </Button>
        <div
          className={`${isRightSidebarCollapsed ? "w-16 ease-in-out duration-700" : "w-80 ease-in-out duration-700"} border rounded-2xl p-4 bg-gray-50 transition-all duration-300 relative overflow-hidden`}
        >
          <nav className="space-y-1">
            <div className="">
              {isRightSidebarCollapsed ? (
                <Calendar className="h-4 w-4 ml-2" />
              ) : (
                <div className="border-b pb-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4" />
                    Attendees
                  </div>
                  <div className="grid grid-cols-6 gap-2 ">
                    {(meetingJoiners as Joiners[])?.map((item, index) => (
                      <div key={index + item.employeeId} className="relative">
                        {item.isTeamLeader && (
                          <span className="absolute -top-0 right-1 z-10 bg-gray-200 shadow-2xl rounded-full p-0.5">
                            <Crown className="w-4 h-4 text-[#303290] drop-shadow" />
                          </span>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Avatar className="h-8 mt-2 w-8 relative cursor-pointer">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AvatarFallback className="font-bold">
                                      <img
                                        src={
                                          item.photo ? item.photo : userProfile
                                        }
                                        alt="profile"
                                        className={`w-full rounded-full object-cover outline-2 outline-blue-400 bg-black ${item.isTeamLeader ? "border-2 border-green-700" : ""}`}
                                      />
                                    </AvatarFallback>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {item.employeeName}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </Avatar>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {!checkedInMap[item.employeeId] ? (
                              <DropdownMenuItem
                                onClick={() => handleCheckIn(item.employeeId)}
                              >
                                Check In
                              </DropdownMenuItem>
                            ) : (
                              isTeamLeader && (
                                <div>
                                  <DropdownMenuItem
                                    onClick={() => handleAddTeamLeader(item)}
                                    className="border mb-2"
                                  >
                                    {item.isTeamLeader
                                      ? "Remove TeamLeader"
                                      : "Add TeamLeader"}
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleCheckOut(item.employeeId)
                                    }
                                    className="border"
                                  >
                                    Check Out
                                  </DropdownMenuItem>
                                </div>
                              )
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Meeting Action Area - always visible, compact in collapsed mode */}
            <div
              className={`mt-5 w-full ${isRightSidebarCollapsed ? "flex flex-col items-center" : ""}`}
            >
              {isRightSidebarCollapsed ? (
                <div className="flex flex-col items-center gap-2 w-full">
                  <Button
                    variant="outline"
                    className="w-12 h-12 p-0 rounded-full bg-[#303290] text-white flex items-center justify-center text-lg font-semibold"
                    onClick={
                      meetingStart
                        ? handleCloseMeetingWithLog
                        : handleStartMeeting
                    }
                    title={meetingStart ? "End Meeting" : "Start Meeting"}
                  >
                    {meetingStart ? <span>■</span> : <span>▶</span>}
                  </Button>
                  <div className="flex flex-col items-center text-xs text-[#303290] font-bold mt-1">
                    {totalMinutes} min
                  </div>
                </div>
              ) : (
                meetingActionArea
              )}
            </div>
            {/* Notes Section - always visible, compact in collapsed mode */}
            {Array.isArray(meetingJoiners) &&
              userId &&
              (isRightSidebarCollapsed ? (
                <div className="mt-6 flex justify-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-12 h-12 p-0 rounded-full flex items-center justify-center"
                        title="Show Notes"
                      >
                        <StickyNote className="h-7 w-7 text-[#303290]" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-80">
                      <MeetingNotes
                        joiners={meetingJoiners as Joiners[]}
                        userId={userId}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              ) : (
                <div className="mt-6 flex justify-center">
                  <MeetingNotes
                    joiners={meetingJoiners as Joiners[]}
                    userId={userId}
                  />
                </div>
              ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
