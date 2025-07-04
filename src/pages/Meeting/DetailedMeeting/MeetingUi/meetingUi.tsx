import { useState, useEffect } from "react";
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

interface MeetingUiProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meetingResponse: any;
  isTeamLeader: boolean;
  activeScreen?: string;
}

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

  // Sync with activeScreen from props for all users
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

  return (
    <div className="flex h-full min-h-[500px] mt-5 overflow-hidden">
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
                className={`flex ${isCollapsed ? "flex-col h-auto gap-2 p-2" : "flex-col h-auto gap-2 p-4 w-full"}`}
              >
                <TabsTrigger
                  value="agenda"
                  className={`justify-start text-left w-full ${isCollapsed ? "p-2" : "gap-2"}`}
                >
                  <ClipboardList className="h-4 w-4" />
                  {!isCollapsed && "Agenda"}
                </TabsTrigger>
                <div className="relative w-full">
                  <div
                    className={`flex items-center justify-between cursor-pointer ${isCollapsed ? "p-2" : "gap-2 p-2"}`}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="h-4 w-4" />
                      {!isCollapsed && "Discussion"}
                    </div>
                  </div>
                  {!isCollapsed && (
                    <div className="ml-6 mt-1 space-y-1">
                      <TabsTrigger
                        value="tasks"
                        className="text-left w-full justify-start text-sm"
                        disabled={!meetingResponse}
                      >
                        Tasks
                      </TabsTrigger>
                      <TabsTrigger
                        value="project"
                        className="w-full justify-start text-left text-sm"
                        disabled={!meetingResponse}
                      >
                        Project
                      </TabsTrigger>
                      <TabsTrigger
                        value="kpis"
                        className="w-full justify-start text-sm"
                        disabled={!meetingResponse}
                      >
                        KPIs
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
                  {!isCollapsed && "Conclusion"}
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
                    ? "calc(100vw - 50px - 400px)"
                    : "calc(100vw - 200px - 350px)",
                  minWidth: 0,
                  transitionDuration: "7000px",
                  animation: "ease-in-out",
                }}
              >
                <TabsContent value="agenda" className="">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Agenda</h3>

                    {/* Two-column layout */}
                    <div className="grid grid-cols-2 border rounded-lg">
                      {/* Issues Column */}
                      <div className="space-y-2 border-r pr-5 py-2 px-4">
                        <h4 className="font-medium">Issues</h4>
                        {/* Hide add/edit UI if cannot edit */}
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
                        meetingId={meetingId ?? ""}
                        tasksFireBase={tasksFireBase}
                      />
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="project" className="p-4 border rounded-lg">
                  {!meetingResponse ? (
                    <div className="text-gray-500 text-sm">
                      This tab will be available when the meeting starts.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Projects
                        meetingId={meetingId ?? ""}
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
                        meetingId={meetingId ?? ""}
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
                      <h3 className="font-semibold">Conclusion (5 min)</h3>
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
  );
}
