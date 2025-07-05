import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardList,
  CalendarCheck,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useMeetingUi from "./useMeetingUi";
import Tasks from "./Tasks";
import Projects from "./Projects/projects";
import KPITable from "./KpiTable";
import Timer from "@/components/shared/Timer";

type HandleTabChangeLocalProps = (tab: string) => void;

interface MeetingUiProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meetingResponse: any;
  isTeamLeader: boolean;
  activeScreen?: string;
}

const TAB_NAMES = ["agenda", "tasks", "project", "kpis", "conclusion"];

export default function MeetingUi({
  meetingResponse,
  isTeamLeader,
  activeScreen,
}: MeetingUiProps) {
  const {
    objectiveInput,
    issueInput,
    handleAddIssue,
    handleAddObjective,
    setIssueInput,
    setObjectiveInput,
    issueData,
    objectiveData,
    editing,
    startEdit,
    cancelEdit,
    updateEdit,
    setEditingValue,
    handleDelete,
    canEdit,
    tabChangeFireBase,
    meetingId,
    tasksFireBase,
    projectFireBase,
    kpisFireBase,
  } = useMeetingUi({ meetingResponse, isTeamLeader });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(
    activeScreen ? activeScreen.toLowerCase() : "agenda",
  );

  const isMeetingStarted = meetingResponse && meetingResponse !== null;

  const safeMeetingId = meetingId ?? "";

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

  const [timerMinutesMap, setTimerMinutesMap] = useState(() => {
    const obj: Record<string, number> = {};
    TAB_NAMES.forEach((tab) => {
      obj[tab] = getInitialMinutes(tab);
    });
    return obj;
  });
  // State for spent time per tab
  const [tabTimes, setTabTimes] = useState(() => {
    const obj: Record<string, number> = {};
    TAB_NAMES.forEach((tab) => {
      obj[tab] = getInitialSpent(tab);
    });
    return obj;
  });

  // Reset timer data when meetingId changes
  useEffect(() => {
    const newTimerMinutesMap: Record<string, number> = {};
    const newTabTimes: Record<string, number> = {};

    TAB_NAMES.forEach((tab) => {
      newTimerMinutesMap[tab] = getInitialMinutes(tab);
      newTabTimes[tab] = getInitialSpent(tab);
    });

    setTimerMinutesMap(newTimerMinutesMap);
    setTabTimes(newTabTimes);
  }, [getInitialMinutes, getInitialSpent, safeMeetingId]);

  // Save timer minutes to localStorage when changed
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
    if (activeScreen && activeScreen.toLowerCase() !== activeTab) {
      setActiveTab(activeScreen.toLowerCase());
    }
  }, [activeScreen, activeTab]);

  const canShowAddEdit = canEdit;

  const handleTabChangeLocal: HandleTabChangeLocalProps = (tab) => {
    setActiveTab(tab);

    if (isTeamLeader) {
      tabChangeFireBase(tab);
    }
  };

  const discussionAllocatedMinutes =
    (timerMinutesMap["tasks"] || 0) +
    (timerMinutesMap["project"] || 0) +
    (timerMinutesMap["kpis"] || 0);
  const discussionAllocatedSeconds = discussionAllocatedMinutes * 60;

  const agendaInitialMinutes = timerMinutesMap["agenda"];
  const agendaSpentSeconds = tabTimes["agenda"] || 0;
  const agendaRemainingSeconds = Math.max(
    0,
    agendaInitialMinutes * 60 - agendaSpentSeconds,
  );

  return (
    <div className="flex gap-3">
      <div className="flex h-full min-h-[500px] mt-5 overflow-hidden w-[75%]">
        <div
          className={`flex transition-all duration-300 ${isCollapsed ? "w-[50px]" : "w-[200px]"}`}
        >
          <Tabs
            orientation="vertical"
            value={activeTab}
            onValueChange={handleTabChangeLocal}
            className={`flex ${isCollapsed ? "flex-col items-center" : ""}`}
          >
            <div className="flex w-full">
              <div className="relative w-fit">
                <TabsList
                  className={`flex ${isCollapsed ? "flex-col h-auto gap-2 p-2" : "flex-col h-auto gap-2 p-2 w-full"}`}
                >
                  <TabsTrigger
                    value="agenda"
                    className={`justify-start text-left w-full ${isCollapsed ? "p-2" : "gap-2"}`}
                  >
                    <ClipboardList className="h-4 w-4" />
                    {!isCollapsed && (
                      <div className="flex items-center w-full gap-6">
                        <span className="flex-1 text-left">Agenda</span>
                        <Timer
                          key={isMeetingStarted + "-" + activeTab}
                          timeOverride={agendaRemainingSeconds}
                          onTimeChange={(minutes) =>
                            handleTimeChange("agenda", minutes)
                          }
                          isActive={activeTab === "agenda" && isMeetingStarted}
                          className="ml-auto"
                          onTimeSpent={(seconds) =>
                            handleTimeSpent("agenda", seconds)
                          }
                          showEditButton={!isMeetingStarted}
                          meetingId={safeMeetingId}
                          tabName="agenda"
                          showIcon={!isMeetingStarted}
                        />
                      </div>
                    )}
                  </TabsTrigger>
                  <div className="relative w-full">
                    <div
                      className={`flex items-center justify-between cursor-pointer ${isCollapsed ? "p-2" : "gap-2 p-2"}`}
                    >
                      <div className="flex items-center w-full gap-6">
                        <CalendarCheck className="h-4 w-4" />
                        {!isCollapsed && (
                          <div className="flex items-center w-full gap-6">
                            <span className="flex-1 text-left">Discussion</span>
                            <Timer
                              timeOverride={discussionAllocatedSeconds}
                              readOnly={true}
                              className="ml-auto"
                              showEditButton={false}
                              meetingId={safeMeetingId}
                              tabName="discussion"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    {!isCollapsed && (
                      <div className="ml-6 mt-1 space-y-1">
                        <TabsTrigger
                          value="tasks"
                          className="text-left w-full justify-start text-sm"
                          disabled={!meetingResponse}
                        >
                          <div className="flex items-center w-full gap-6">
                            <span className="flex-1 text-left">Tasks</span>
                            <Timer
                              key={isMeetingStarted + "-" + activeTab}
                              initialMinutes={timerMinutesMap["tasks"]}
                              onTimeChange={(minutes) =>
                                handleTimeChange("tasks", minutes)
                              }
                              isActive={
                                activeTab === "tasks" && isMeetingStarted
                              }
                              className="ml-auto"
                              onTimeSpent={(seconds) =>
                                handleTimeSpent("tasks", seconds)
                              }
                              showEditButton={!isMeetingStarted}
                              meetingId={safeMeetingId}
                              tabName="tasks"
                              showIcon={!isMeetingStarted}
                            />
                          </div>
                        </TabsTrigger>
                        <TabsTrigger
                          value="project"
                          className="w-full justify-start text-left text-sm"
                          disabled={!meetingResponse}
                        >
                          <div className="flex items-center w-full gap-6">
                            <span className="flex-1 text-left">Project</span>
                            <Timer
                              key={isMeetingStarted + "-" + activeTab}
                              initialMinutes={timerMinutesMap["project"]}
                              onTimeChange={(minutes) =>
                                handleTimeChange("project", minutes)
                              }
                              isActive={
                                activeTab === "project" && isMeetingStarted
                              }
                              className="ml-auto"
                              onTimeSpent={(seconds) =>
                                handleTimeSpent("project", seconds)
                              }
                              showEditButton={!isMeetingStarted}
                              meetingId={safeMeetingId}
                              tabName="project"
                              showIcon={!isMeetingStarted}
                            />
                          </div>
                        </TabsTrigger>
                        <TabsTrigger
                          value="kpis"
                          className="w-full justify-start text-sm"
                          disabled={!meetingResponse}
                        >
                          <div className="flex items-center w-full gap-6">
                            <span className="flex-1 text-left">KPIs</span>
                            <Timer
                              key={isMeetingStarted + "-" + activeTab}
                              initialMinutes={timerMinutesMap["kpis"]}
                              onTimeChange={(minutes) =>
                                handleTimeChange("kpis", minutes)
                              }
                              isActive={
                                activeTab === "kpis" && isMeetingStarted
                              }
                              className="ml-auto"
                              onTimeSpent={(seconds) =>
                                handleTimeSpent("kpis", seconds)
                              }
                              showEditButton={!isMeetingStarted}
                              meetingId={safeMeetingId}
                              tabName="kpis"
                              showIcon={!isMeetingStarted}
                            />
                          </div>
                        </TabsTrigger>
                      </div>
                    )}
                  </div>
                  <TabsTrigger
                    value="conclusion"
                    className={`justify-start text-left w-full ${isCollapsed ? "p-2" : "gap-2"}`}
                    disabled={!meetingResponse}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {!isCollapsed && (
                      <div className="flex items-center w-full gap-6">
                        <span className="flex-1 text-left">Conclusion</span>
                        {/* <Timer
                          initialMinutes={timerMinutesMap["conclusion"]}
                          onTimeChange={(minutes) =>
                            handleTimeChange("conclusion", minutes)
                          }
                          isActive={
                            activeTab === "conclusion" && isMeetingStarted
                          }
                          className="ml-auto"
                          showEditButton={true}
                          meetingId={safeMeetingId}
                          tabName="conclusion"
                        /> */}
                      </div>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>
              <Card className="ml-5 p-0 gap-2">
                <div>
                  <Button
                    variant="ghost"
                    className={` ${isCollapsed ? "rotate-180" : ""}`}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                  >
                    {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
                  </Button>
                </div>
                <div
                  className="flex-1 px-4 max-h-[500px] min-h-[500px] overflow-x-auto transition-all duration-300"
                  style={{
                    width: isCollapsed
                      ? "calc(100vw - 50px - 700px)"
                      : "calc(100vw - 200px - 850px)",
                    minWidth: 0,
                    transitionDuration: "7000px",
                    animation: "ease-in-out",
                  }}
                >
                  <TabsContent value="agenda" className="">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Agenda</h3>

                      <div className="grid grid-cols-2 border rounded-lg">
                        <div className="space-y-2 border-r pr-5 py-2 px-4">
                          <h4 className="font-medium">Issues</h4>
                          {canShowAddEdit && (
                            <div className="flex gap-2">
                              <Input
                                value={issueInput}
                                onChange={(e) => setIssueInput(e.target.value)}
                                placeholder="Enter an issue"
                              />
                              <Button onClick={() => handleAddIssue()}>
                                Add
                              </Button>
                            </div>
                          )}
                          <div className="mt-2 space-y-2">
                            {issueData?.data && issueData.data.length > 0 ? (
                              <ul className="space-y-2">
                                {issueData?.data &&
                                  issueData.data.map((item) => (
                                    <li
                                      key={item.detailMeetingAgendaIssueId}
                                      className="flex items-center justify-between px-2 border rounded"
                                    >
                                      {editing.type === "issue" &&
                                      editing.id ===
                                        item.detailMeetingAgendaIssueId &&
                                      canShowAddEdit ? (
                                        <>
                                          <Input
                                            value={editing.value}
                                            onChange={(e) =>
                                              setEditingValue(e.target.value)
                                            }
                                            className="mr-2"
                                          />
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={updateEdit}
                                            className="mr-1"
                                          >
                                            Submit
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={cancelEdit}
                                          >
                                            Cancel
                                          </Button>
                                        </>
                                      ) : (
                                        <>
                                          <span>{item.agendaIssue}</span>
                                          {canShowAddEdit && (
                                            <div className="flex gap-1">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  startEdit(
                                                    "issue",
                                                    item.detailMeetingAgendaIssueId,
                                                    item.agendaIssue,
                                                  )
                                                }
                                              >
                                                <Pencil className="h-4 w-4 text-blue-500" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  handleDelete(
                                                    item.detailMeetingAgendaIssueId,
                                                    "Issue",
                                                  )
                                                }
                                              >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                              </Button>
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </li>
                                  ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500 text-sm">
                                No issues added
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Suggestions Column */}
                        <div className="space-y-2 py-2 px-4">
                          <h4 className="font-medium">Objective</h4>
                          {canShowAddEdit && (
                            <div className="flex gap-2">
                              <Input
                                value={objectiveInput}
                                onChange={(e) =>
                                  setObjectiveInput(e.target.value)
                                }
                                placeholder="Enter a suggestion"
                              />
                              <Button onClick={() => handleAddObjective()}>
                                Add
                              </Button>
                            </div>
                          )}
                          <div className="mt-2 space-y-2">
                            {objectiveData?.data &&
                            objectiveData.data.length > 0 ? (
                              <ul className="space-y-2">
                                {objectiveData?.data &&
                                  objectiveData.data.map((item) => (
                                    <li
                                      key={item.detailMeetingAgendaObjectiveId}
                                      className="flex items-center justify-between px-2 border rounded"
                                    >
                                      {editing.type === "objective" &&
                                      editing.id ===
                                        item.detailMeetingAgendaObjectiveId &&
                                      canShowAddEdit ? (
                                        <>
                                          <Input
                                            value={editing.value}
                                            onChange={(e) =>
                                              setEditingValue(e.target.value)
                                            }
                                            className="mr-2"
                                          />
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={updateEdit}
                                            className="mr-1"
                                          >
                                            Submit
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={cancelEdit}
                                          >
                                            Cancel
                                          </Button>
                                        </>
                                      ) : (
                                        <>
                                          <span>{item.agendaObjective}</span>
                                          {canShowAddEdit && (
                                            <div className="flex gap-1">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  startEdit(
                                                    "objective",
                                                    item.detailMeetingAgendaObjectiveId,
                                                    item.agendaObjective,
                                                  )
                                                }
                                              >
                                                <Pencil className="h-4 w-4 text-blue-500" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  handleDelete(
                                                    item.detailMeetingAgendaObjectiveId,
                                                    "Objective",
                                                  )
                                                }
                                              >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                              </Button>
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </li>
                                  ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500 text-sm">
                                No Objective added
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="tasks" className="p-4 border rounded-lg">
                    {!meetingResponse ? (
                      <div className="text-gray-500 text-sm">
                        This tab will be available when the meeting starts.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Tasks
                          meetingId={safeMeetingId}
                          tasksFireBase={tasksFireBase}
                        />
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent
                    value="project"
                    className="p-4 border rounded-lg"
                  >
                    {!meetingResponse ? (
                      <div className="text-gray-500 text-sm">
                        This tab will be available when the meeting starts.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Projects
                          meetingId={safeMeetingId}
                          projectFireBase={projectFireBase}
                        />
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="kpis" className="p-4 border rounded-lg">
                    {!meetingResponse ? (
                      <div className="text-gray-500 text-sm">
                        This tab will be available when the meeting starts.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <KPITable
                          meetingId={safeMeetingId}
                          kpisFireBase={kpisFireBase}
                        />
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent
                    value="conclusion"
                    className="p-4 border rounded-lg"
                  >
                    {!meetingResponse ? (
                      <div className="text-gray-500 text-sm">
                        This tab will be available when the meeting starts.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h3 className="font-semibold">
                          Conclusion ({timerMinutesMap["conclusion"]} min)
                        </h3>
                        <p>Summarize key points and action items</p>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Card>
            </div>
          </Tabs>
        </div>
      </div>
      <div className="w-[28%]">dddd</div>
    </div>
  );
}
