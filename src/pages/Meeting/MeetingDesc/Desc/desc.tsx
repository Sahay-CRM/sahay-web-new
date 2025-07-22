import { SpinnerIcon } from "@/components/shared/Icons";
import Timer from "../Timer";
import useDesc from "./useDesc";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  List,
} from "lucide-react";
import Projects from "../Projects";
import Tasks from "../Tasks";
import KPITable from "../KpiTable";

interface DescProps {
  meetingResponse?: MeetingResFire | null;
  meetingStatus: string;
  detailMeetingId: string | undefined;
  meetingId: string;
}

export default function Desc({
  meetingStatus,
  meetingResponse,
  detailMeetingId,
  meetingId,
}: DescProps) {
  const {
    totalData,
    currentIndex,
    allItems,
    handleConclusionMeeting,
    handleNextWithLog,
    handlePreviousWithLog,
    handleJump,
    isLoading,
    isSidebarCollapsed,
    currentItem,
    setIsSidebarCollapsed,
    detailAgendaData,
    handleTabChange,
    activeTab,
    tasksFireBase,
    projectsFireBase,
    kpisFireBase,
  } = useDesc({ meetingResponse, detailMeetingId });

  if (isLoading && meetingResponse) {
    return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin">
          <SpinnerIcon />
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return <div>No agenda item selected.</div>;
  }

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1 ml-4">
        {/* Existing main content */}
        <div className="">
          <div className="flex items-center gap-4 rounded-xl bg-white px-2 py-2 shadow mb-6">
            <div className="w-1/2 flex items-center gap-4">
              <div>
                <span className="text-lg font-bold min-w-[120px] text-primary">
                  {(allItems && allItems[currentIndex]?.name) || "-"}
                </span>
                <span className="text-md text-black ml-3 text-center">
                  ({currentIndex + 1} / {totalData})
                </span>
              </div>
            </div>
            <div className="w-1/2 flex justify-end">
              <Timer
                plannedTime={Number(currentItem?.plannedTime)}
                actualTime={Number(
                  meetingResponse?.timers.objectives?.[
                    currentItem.detailMeetingAgendaIssueId ?? 0
                  ].actualTime,
                )}
                lastSwitchTimestamp={Number(
                  meetingResponse?.state.lastSwitchTimestamp,
                )}
                isEditMode={false}
                meetingStart={true}
                className="text-2xl font-medium text-primary mr-2"
              />
              <Button
                variant="outline"
                onClick={handlePreviousWithLog}
                disabled={currentIndex === 0}
                className="mx-1"
              >
                Previous
              </Button>

              <Button
                variant="outline"
                onClick={handleNextWithLog}
                disabled={currentIndex === totalData - 1}
                className="mx-1"
              >
                Next
              </Button>

              <div className="">
                <select
                  id="jump-to"
                  value={currentIndex}
                  onChange={(e) => handleJump(Number(e.target.value))}
                  className="border-b border-black px-2 py-1 focus:outline-none focus:ring-0"
                >
                  {allItems &&
                    allItems.map((item, index) => (
                      <option key={index} value={index}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>
              {meetingStatus === "DISCUSSION" && (
                <Button
                  variant="outline"
                  className="ml-5 bg-primary text-white"
                  onClick={handleConclusionMeeting}
                >
                  Conclusion
                </Button>
              )}
            </div>
          </div>

          <div className="w-full">
            {detailAgendaData ? (
              <div
                className={`flex h-[calc(100vh-150px)] ${isSidebarCollapsed ? "gap-3" : "gap-8"}  w-full relative`}
              >
                <div
                  className={`transition-all duration-300 bg-white shadow rounded-xl
          ${isSidebarCollapsed ? "w-12" : "w-64"} 
          min-h-[200px] flex flex-col items-center`}
                >
                  <nav className="space-y-1 w-full">
                    <div className="w-full flex flex-col items-center px-1">
                      <Button
                        variant={activeTab === "tasks" ? "default" : "ghost"}
                        className={`w-full justify-start border cursor-pointer mb-2 flex items-center ${isSidebarCollapsed ? "justify-center px-0" : "px-4"}`}
                        onClick={() => handleTabChange("tasks")}
                      >
                        <List className="h-5 w-5" />
                        {!isSidebarCollapsed && (
                          <span className="ml-2">Tasks</span>
                        )}
                      </Button>
                      <Button
                        variant={activeTab === "projects" ? "default" : "ghost"}
                        className={`w-full justify-start border cursor-pointer mb-2 flex items-center ${isSidebarCollapsed ? "justify-center px-0" : "px-4"}`}
                        onClick={() => handleTabChange("projects")}
                      >
                        <CheckSquare className="h-5 w-5" />
                        {!isSidebarCollapsed && (
                          <span className="ml-2">Projects</span>
                        )}
                      </Button>

                      <Button
                        variant={activeTab === "kpis" ? "default" : "ghost"}
                        className={`w-full justify-start border cursor-pointer flex items-center ${isSidebarCollapsed ? "justify-center px-0" : "px-4"}`}
                        onClick={() => handleTabChange("kpis")}
                      >
                        <BarChart2 className="h-5 w-5" />
                        {!isSidebarCollapsed && (
                          <span className="ml-2">KPIs</span>
                        )}
                      </Button>
                    </div>
                  </nav>
                </div>
                <div
                  // className="relative flex-1 w-full p-6 bg-white rounded-2xl shadow-lg border"
                  className={`transition-all relative flex-1 duration-300 bg-white shadow-lg border rounded-xl
          ${isSidebarCollapsed ? "w-12" : "w-64"} 
          min-h-[200px] items-center`}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className=" z-50 rounded-full w-9 h-9 bg-white border shadow-sm absolute -left-4 -top-4"
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  >
                    {isSidebarCollapsed ? (
                      <ChevronRight className="h-6 w-6" />
                    ) : (
                      <ChevronLeft className="h-6 w-6" />
                    )}
                  </Button>
                  {activeTab === "tasks" && (
                    <div className="overflow-x-auto">
                      <Tasks
                        tasksFireBase={tasksFireBase}
                        meetingAgendaIssueId={
                          currentItem.detailMeetingAgendaIssueId
                        }
                        detailMeetingId={detailMeetingId}
                      />
                    </div>
                  )}
                  {activeTab === "projects" && (
                    <div>
                      <div className="overflow-x-auto ">
                        <Projects
                          meetingId={meetingId}
                          projectsFireBase={projectsFireBase}
                          meetingAgendaIssueId={
                            currentItem.detailMeetingAgendaIssueId
                          }
                          detailMeetingId={detailMeetingId}
                        />
                      </div>
                    </div>
                  )}
                  {activeTab === "kpis" && (
                    <div>
                      <div className="overflow-x-auto p-4">
                        <KPITable
                          meetingId={meetingId}
                          kpisFireBase={kpisFireBase}
                          meetingAgendaIssueId={
                            currentItem.detailMeetingAgendaIssueId
                          }
                          detailMeetingId={detailMeetingId}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
