import { useEffect } from "react";
import { useSelector } from "react-redux";

import {
  Crown,
  FileText,
  Notebook,
  Search,
  Users,
  UsersRound,
  X,
} from "lucide-react";

import useMeetingDesc from "./useMeetingDesc";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import Agenda from "./Agenda";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import MeetingNotes from "./Agenda/meetingNotes";
import { getUserId } from "@/features/selectors/auth.selector";
// import { DropdownMenu } from "@/components/ui/dropdown-menu";
// import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getInitials } from "@/features/utils/app.utils";
import { ImageBaseURL } from "@/features/utils/urls.utils";
// import MeetingTimer from "./meetingTimer";

export default function MeetingDesc() {
  const {
    meetingStatus,
    meetingId,
    meetingResponse,
    meetingTiming,
    isSidebarCollapsed,
    handleTabChange,
    activeTab,
    isCardVisible,
    setIsCardVisible,
    openEmployeeId,
    setOpenEmployeeId,
    handleAddTeamLeader,
    handleCheckOut,
    follow,
    handleFollow,
    handleCheckIn,
  } = useMeetingDesc();
  const { setBreadcrumbs } = useBreadcrumbs();

  const userId = useSelector(getUserId);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Meeting", href: "/dashboard/meeting" },
      { label: "Meeting Detail", href: "" },
      { label: `${meetingTiming?.meetingName}`, href: "", isHighlight: true },
    ]);
  }, [meetingTiming?.meetingName, setBreadcrumbs]);

  const isTeamLeader = meetingTiming?.employeeList?.find(
    (item) => item.employeeId === userId,
  )?.isTeamLeader;

  return (
    <div className="flex w-full h-full bg-gray-200 overflow-hidden">
      <div
        className={cn(
          "bg-white p-4 flex-1 min-w-0",
          "transition-all duration-300 ease-in-out",
        )}
      >
        <div className="w-full mt-4 overflow-hidden">
          <Agenda
            meetingName={meetingTiming?.meetingName ?? ""}
            meetingId={meetingId ?? ""}
            meetingStatus={meetingStatus}
            meetingResponse={meetingResponse}
            agendaPlannedTime={meetingTiming?.agendaTimePlanned}
            detailMeetingId={meetingTiming?.detailMeetingId}
            joiners={meetingTiming?.employeeList ?? []}
            meetingTime={meetingTiming?.meetingTimePlanned}
            isTeamLeader={
              meetingTiming?.employeeList?.find(
                (item) => item.employeeId === userId,
              )?.isTeamLeader
            }
            isCheckIn={
              meetingTiming?.employeeList?.find(
                (item) => item.employeeId === userId,
              )?.attendanceMark
            }
            follow={meetingResponse?.state.follow === userId}
          />
        </div>
      </div>
      <div
        className={cn(
          "h-full rounded-lg mx-3",
          "transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.5,1)]",
          isCardVisible ? "w-[400px] opacity-100" : "w-0 opacity-0",
        )}
      >
        <Card className="h-full w-full p-0">
          {activeTab === "joiners" && (
            <div>
              <div className="h-[64px] flex items-center justify-between py-3 border-b px-3 mb-3">
                <h3 className="p-0 text-base">Meeting Joiners</h3>
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <X
                    className="w-5 h-5 text-gray-500 cursor-pointer"
                    onClick={() => setIsCardVisible(false)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {(meetingTiming?.employeeList || []).map((item, index) => {
                  const isOpen = openEmployeeId === item.employeeId;
                  const toggleOpen = () =>
                    setOpenEmployeeId(isOpen ? null : item.employeeId);

                  const teamLeaderCount = (
                    meetingTiming?.employeeList || []
                  ).filter((emp) => emp.isTeamLeader).length;

                  return (
                    <div
                      key={index + item.employeeId}
                      className="rounded-md bg-white shadow-sm p-3"
                    >
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={toggleOpen}
                      >
                        <div className="relative">
                          {item.isTeamLeader && (
                            <span className="absolute -top-1 right-0 z-10 bg-white shadow-2xl rounded-full p-0.5">
                              <Crown className="w-4 h-4 text-[#303290] drop-shadow" />
                            </span>
                          )}

                          <Avatar className="h-10 w-10 relative">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  {item.employeeImage ? (
                                    <img
                                      src={`${ImageBaseURL}/share/company/profilePics/${item.employeeImage}`}
                                      alt={item.employeeName}
                                      className="w-full h-full rounded-full object-cover outline-2 outline-blue-400 bg-black"
                                    />
                                  ) : (
                                    <AvatarFallback className="bg-gray-300 text-gray-700 font-semibold text-sm">
                                      {getInitials(item.employeeName)}
                                    </AvatarFallback>
                                  )}
                                </TooltipTrigger>
                                <TooltipContent>
                                  {item.employeeName}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Avatar>
                        </div>

                        <div className="text-sm font-medium text-gray-800">
                          {item.employeeName}
                        </div>
                      </div>

                      {/* Accordion content (only if open) */}
                      {isOpen &&
                        meetingStatus !== "NOT_STARTED" &&
                        meetingStatus !== "ENDED" && (
                          <div className="mt-3 pl-12 flex flex-col gap-2">
                            {isTeamLeader && (
                              <>
                                {!item.isTeamLeader && (
                                  <button
                                    onClick={() => handleAddTeamLeader(item)}
                                    className="text-sm text-left px-3 py-1 border rounded hover:bg-gray-100"
                                  >
                                    Add Team Leader
                                  </button>
                                )}

                                {item.isTeamLeader && teamLeaderCount > 1 && (
                                  <button
                                    onClick={() => handleAddTeamLeader(item)}
                                    className="text-sm text-left px-3 py-1 border rounded hover:bg-gray-100"
                                  >
                                    Remove Team Leader
                                  </button>
                                )}
                              </>
                            )}

                            {item.attendanceMark ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleCheckOut(item.employeeId)
                                  }
                                  className="text-sm text-left px-3 py-1 border rounded hover:bg-gray-100"
                                >
                                  Check Out
                                </button>

                                {item.isTeamLeader &&
                                  item.employeeId === follow && (
                                    <button
                                      onClick={() =>
                                        handleFollow(item.employeeId)
                                      }
                                      className="text-sm text-left px-3 py-1 border rounded hover:bg-gray-100"
                                    >
                                      Follow
                                    </button>
                                  )}
                              </>
                            ) : (
                              <button
                                onClick={() => handleCheckIn(item.employeeId)}
                                className="text-sm text-left px-3 py-1 border rounded hover:bg-gray-100"
                              >
                                Check In
                              </button>
                            )}
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div>
              <div className="h-[64px] flex items-center justify-between py-3 border-b px-3 mb-3">
                <h3 className="p-0 text-base">Meeting Nots</h3>
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <X
                    className="w-5 h-5 text-gray-500 cursor-pointer"
                    onClick={() => setIsCardVisible(false)}
                  />
                </div>
              </div>
              <div className="px-2">
                {meetingId && meetingTiming?.employeeList && (
                  <MeetingNotes
                    joiners={meetingTiming?.employeeList}
                    meetingId={meetingId}
                    detailMeetingId={meetingTiming?.detailMeetingId}
                    employeeId={userId}
                    className="min-h-[40%] mt-2 max-h-[calc(100vh-200px)] overflow-hidden"
                    meetingName={meetingTiming.meetingName}
                    meetingStatus={meetingStatus}
                  />
                )}
              </div>
            </div>
          )}
          {activeTab === "participants" && <div>Participants List</div>}
          {activeTab === "notes" && <div>Meeting Notes</div>}
        </Card>
      </div>
      <div
        className={`${isSidebarCollapsed ? "bg-white border rounded-md" : ""} flex flex-col z-30`}
      >
        <nav className="space-y-1 w-[56px]">
          <Button
            className={`w-full bg-transparent p-0 hover:bg-gray-300 rounded-full text-black justify-start cursor-pointer flex items-center ${isSidebarCollapsed ? "justify-center" : ""}`}
            onClick={() => {
              handleTabChange("joiners");
            }}
          >
            <UsersRound className="w-16 h-16" />
          </Button>
          <Button
            className={`w-full bg-transparent hover:bg-gray-300 rounded-full text-black justify-start cursor-pointer flex items-center ${isSidebarCollapsed ? "justify-center" : ""}`}
            onClick={() => handleTabChange("documents")}
          >
            <FileText className="h-6 w-6" />
          </Button>

          <Button
            className={`w-full bg-transparent hover:bg-gray-300 rounded-full text-black justify-start cursor-pointer flex items-center ${isSidebarCollapsed ? "justify-center p-0" : "p-2"}`}
            onClick={() => handleTabChange("participants")}
          >
            <Users className="h-6 w-6" />
          </Button>

          <Button
            className={`w-full bg-transparent hover:bg-gray-300 rounded-full text-black justify-start cursor-pointer flex items-center ${isSidebarCollapsed ? "justify-center p-0" : "p-2"}`}
            onClick={() => handleTabChange("notes")}
          >
            <Notebook className="h-6 w-6" />
          </Button>
        </nav>
      </div>
    </div>
  );
}
