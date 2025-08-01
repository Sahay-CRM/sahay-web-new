import { SpinnerIcon } from "@/components/shared/Icons";
// import Timer from "../Timer";
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
import MeetingDrawer from "../Agenda/MeetingDrawer";
import { useSelector } from "react-redux";
import { getUserId } from "@/features/selectors/auth.selector";

interface DescProps {
  meetingResponse?: MeetingResFire | null;
  meetingStatus: string;
  detailMeetingId: string | undefined;
  meetingId: string;
  joiners: Joiners[];
}

export default function Desc({
  meetingStatus,
  meetingResponse,
  detailMeetingId,
  meetingId,
  joiners,
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
  const userId = useSelector(getUserId);
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
          <div className="w-full mb-5 bg-white ">
            <div className="flex items-center gap-2">
              {/* Dropdown with index count */}
              <div className="relative w-[60%]">
                <select
                  id="jump-to"
                  value={currentIndex}
                  onChange={(e) => handleJump(Number(e.target.value))}
                  className="w-full text-lg font-bold text-primary px-4 bg-transparent border border-gray-500 rounded-md h-10"
                >
                  {allItems?.map((item, index) => (
                    <option key={index} value={index}>
                      {item.name}
                    </option>
                  ))}
                </select>

                {/* Count before native arrow */}
                <span className="absolute right-10 top-1/2 -translate-y-1/2 text-md text-black pointer-events-none">
                  ({currentIndex + 1} / {totalData})
                </span>
              </div>

              {/* Navigation + Action Buttons */}
              <div className="flex items-center w-[40%] justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handlePreviousWithLog}
                  disabled={currentIndex === 0}
                  className="px-4 py-5  text-lg"
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  onClick={handleNextWithLog}
                  disabled={currentIndex === totalData - 1}
                  className="px-4 py-5  text-lg"
                >
                  Next
                </Button>

                {meetingStatus === "DISCUSSION" && (
                  <Button
                    variant="outline"
                    className="bg-primary text-white px-4 py-5 text-sm sm:text-base md:text-lg"
                    onClick={handleConclusionMeeting}
                  >
                    Go To Conclusion
                  </Button>
                )}

                <div className="flex items-center justify-center w-[150px] rounded-md border border-gray-500 px-3 py-1">
                  {/* <Timer
                    plannedTime={Number(currentItem?.plannedTime)}
                    actualTime={Number(
                      meetingResponse?.timers.objectives?.[
                        currentItem.detailMeetingAgendaIssueId ?? 0
                      ]?.actualTime,
                    )}
                    lastSwitchTimestamp={Number(
                      meetingResponse?.state.lastSwitchTimestamp,
                    )}
                    isEditMode={false}
                    meetingStart={true}
                    className="text-xl sm:text-2xl  font-semibold  text-primary"
                  /> */}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            {detailAgendaData ? (
              <div
                className={`flex h-[calc(100vh-150px)] ${isSidebarCollapsed ? "gap-3" : "gap-8"}  w-full relative`}
              >
                <div
                  className={`transition-all duration-300  bg-white  
                    ${isSidebarCollapsed ? "w-[60px] p-2" : "w-[350px]"} 
                    min-h-[200px] max-h-[710px]  flex flex-col items-center`}
                >
                  <nav className="space-y-1 w-full ">
                    <div className="w-full flex flex-col items-center rounded-2xl   px-1">
                      <Button
                        variant={activeTab === "tasks" ? "default" : "ghost"}
                        className={`w-full justify-start border cursor-pointer mb-2 flex items-center ${isSidebarCollapsed ? "justify-center px-0" : "px-4"}`}
                        onClick={() => {
                          handleTabChange("tasks");
                          setIsSidebarCollapsed(false); // ✅ open sidebar on click
                        }}
                      >
                        <List className="h-5 w-5" />
                        {!isSidebarCollapsed && (
                          <span className="ml-2">Tasks</span>
                        )}
                      </Button>
                      <Button
                        variant={activeTab === "projects" ? "default" : "ghost"}
                        className={`w-full justify-start border cursor-pointer mb-2 flex items-center ${isSidebarCollapsed ? "justify-center px-0" : "px-4"}`}
                        onClick={() => {
                          handleTabChange("projects");
                          setIsSidebarCollapsed(false);
                        }}
                      >
                        <CheckSquare className="h-5 w-5" />
                        {!isSidebarCollapsed && (
                          <span className="ml-2">Projects</span>
                        )}
                      </Button>

                      <Button
                        variant={activeTab === "kpis" ? "default" : "ghost"}
                        className={`w-full justify-start border cursor-pointer flex items-center ${isSidebarCollapsed ? "justify-center px-0" : "px-4"}`}
                        onClick={() => {
                          handleTabChange("kpis");
                          setIsSidebarCollapsed(false);
                        }}
                      >
                        <BarChart2 className="h-5 w-5" />
                        {!isSidebarCollapsed && (
                          <span className="ml-2">KPIs</span>
                        )}
                      </Button>
                    </div>
                  </nav>

                  <div
                    className="w-full mt-5 h-[540px] max-h-[540px] relative"
                    onClick={() => setIsSidebarCollapsed(false)} // click anywhere opens sidebar
                  >
                    {/* Meeting Drawer */}
                    <MeetingDrawer
                      joiners={joiners}
                      meetingId={meetingId}
                      employeeId={userId}
                      sidebarOpen={!isSidebarCollapsed}
                      setSidebarOpen={(open) => setIsSidebarCollapsed(!open)}
                      detailMeetingId={detailMeetingId}
                      meetingStart={meetingStatus !== "NOT_STARTED"}
                      show={true}
                      showToggle={false}
                      height="540px"
                    />

                    {/* Toggle Button positioned center-right of MeetingDrawer */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="z-50 rounded-full w-9 h-9 bg-white border shadow-sm absolute -right-4 top-1/2 -translate-y-1/2"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent parent click
                        setIsSidebarCollapsed(!isSidebarCollapsed);
                      }}
                    >
                      {isSidebarCollapsed ? (
                        <ChevronLeft className="h-6 w-6" />
                      ) : (
                        <ChevronRight className="h-6 w-6" />
                      )}
                    </Button>
                  </div>
                </div>
                <div
                  // className="relative flex-1 w-full p-6 bg-white rounded-2xl shadow-lg border"
                  className={`transition-all h-[calc(100vh-210px)] relative flex-1 duration-300 bg- shadow-lg border rounded-xl
          ${isSidebarCollapsed ? "w-12" : "w-64"} 
          min-h-[200px] items-center`}
                >
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
