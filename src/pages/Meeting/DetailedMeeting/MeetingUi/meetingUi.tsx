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
} from "lucide-react";
import Timer from "@/components/shared/Timer";
import Tasks from "./Tasks";
import Projects from "./Projects/projects";
import KPITable from "./KpiTable";
import useMeetingUi from "./useMeetingUi";
import Agenda from "./Agenda";

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
}

export default function MeetingUI({
  meetingStart,
  isTeamLeader,
  onTabTimesChange,
  meetingTiming,
}: MeetingUiProps) {
  const {
    tabChangeFireBase,
    meetingId,
    tasksFireBase,
    projectFireBase,
    kpisFireBase,
    timerMinutesMap,
    setTimerMinutesMap,
  } = useMeetingUi({ meetingStart, isTeamLeader, meetingTiming });

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

  return (
    <div className="w-full">
      <div className="flex h-screen relative">
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
          <h1
            className={`text-xl font-bold mb-6 flex items-center ${isRightSidebarCollapsed ? "justify-center" : "justify-start"}`}
          >
            {isRightSidebarCollapsed ? (
              <List className="h-5 w-5" />
            ) : (
              "Core Team Meeting"
            )}
          </h1>

          <nav className="space-y-1">
            <Button
              variant={activeTab === "agenda" ? "default" : "ghost"}
              className={`${isRightSidebarCollapsed ? "w-8 h-8 p-0 justify-center" : "w-full justify-start"} border cursor-pointer`}
              onClick={() => handleTabChange("agenda")}
            >
              {isRightSidebarCollapsed ? (
                <Calendar className="h-4 w-4" />
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Agenda
                  <Timer
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
                className={`${isRightSidebarCollapsed ? "w-8 h-8 p-0 justify-center" : "w-full justify-between"} bg-gray-200 border my-2 `}
              >
                {isRightSidebarCollapsed ? (
                  <Folder className="h-4 w-4" />
                ) : (
                  <>
                    <div className="flex items-center text-black">
                      <Folder className="mr-2 h-4 w-4" />
                      Discussion
                    </div>
                    {!isRightSidebarCollapsed && (
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

              {!isRightSidebarCollapsed && (
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
          </nav>
        </div>
      </div>
    </div>
  );
}
