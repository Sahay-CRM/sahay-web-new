import useMeetingDesc from "./useMeetingDesc";
import Desc from "../MeetingDesc/Desc/desc";
import Conclusion from "../MeetingDesc/Conclusion/conclusion";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect, useContext } from "react";
import Agenda from "./Agenda";
import { SidebarControlContext } from "@/features/layouts/DashboardLayout/SidebarControlContext";
import { Button } from "@/components/ui/button";
import { Crown, FileText, Notebook, Users, UsersRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import MeetingNotes from "./Agenda/meetingNotes";
import { useSelector } from "react-redux";
import { getUserId } from "@/features/selectors/auth.selector";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function MeetingDesc() {
  const {
    handleStartMeeting,
    handleDesc,
    meetingStatus,
    isPending,
    meetingId,
    meetingResponse,
    meetingTiming,
    isSidebarCollapsed,
    handleTabChange,
    activeTab,
    isCardVisible,
  } = useMeetingDesc();
  const { setBreadcrumbs } = useBreadcrumbs();
  const sidebarControl = useContext(SidebarControlContext);
  const userId = useSelector(getUserId);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Meeting", href: "/dashboard/meeting" },
      { label: "Meeting Detail", href: "" },
      { label: `${meetingTiming?.meetingName}`, href: "" },
    ]);
  }, [meetingTiming?.meetingName, setBreadcrumbs]);

  // Wrap handleStartMeeting to also collapse sidebar
  const handleStartMeetingWithSidebar = () => {
    if (sidebarControl?.setOpen) {
      sidebarControl.setOpen(false);
    }
    handleStartMeeting();
  };

  let content = null;
  if (meetingStatus === "NOT_STARTED" || meetingStatus === "STARTED") {
    content = (
      <Agenda
        meetingName={meetingTiming?.meetingName ?? ""}
        meetingId={meetingId ?? ""}
        meetingStatus={meetingStatus}
        meetingResponse={meetingResponse}
        agendaPlannedTime={meetingTiming?.agendaTimePlanned}
        detailMeetingId={meetingTiming?.detailMeetingId}
        handleStartMeeting={handleStartMeetingWithSidebar}
        handleDesc={handleDesc}
        joiners={meetingTiming?.employeeList ?? []}
        isPending={isPending}
      />
    );
  } else if (meetingStatus === "DISCUSSION") {
    content = (
      <Desc
        meetingStatus={meetingStatus}
        meetingResponse={meetingResponse}
        detailMeetingId={meetingTiming?.detailMeetingId}
        meetingId={meetingId ?? ""}
        joiners={meetingTiming?.employeeList ?? []}
      />
    );
  } else if (meetingStatus === "CONCLUSION" || meetingStatus === "ENDED") {
    content = (
      <Conclusion
        meetingStatus={meetingStatus}
        meetingResponse={meetingResponse}
        detailMeetingId={meetingTiming?.detailMeetingId}
      />
    );
  }

  const getInitials = (name: string) => {
    if (!name) return "";
    const names = name.split(" ");
    const firstInitial = names[0]?.charAt(0) || "";
    const secondInitial = names.length > 1 ? names[1]?.charAt(0) || "" : "";
    return (firstInitial + secondInitial).toUpperCase();
  };

  return (
    <div className="flex w-full h-full bg-gray-200 overflow-hidden">
      <div className="w-full px-4 py-4 bg-white">{content}</div>
      <div
        className={cn(
          "h-full overflow-hidden rounded-lg mx-3",
          "transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.5,1)]", // Smooth ease-in-out
          isCardVisible ? "w-[350px] opacity-100" : "w-0 opacity-0",
        )}
      >
        <Card className="h-full w-full">
          {activeTab === "joiners" && (
            <div className="flex gap-3 justify-between">
              {(meetingTiming?.employeeList || []).map((item, index) => (
                <div key={index + item.employeeId} className="relative">
                  {item.isTeamLeader && (
                    <span className="absolute -top-0 right-1 z-10 bg-white shadow-2xl rounded-full p-0.5">
                      <Crown className="w-4 h-4 text-[#303290] drop-shadow" />
                    </span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      disabled={meetingStatus !== "NOT_STARTED"}
                    >
                      <Avatar className="h-8 mt-2 w-8 relative cursor-pointer">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {item.photo ? (
                                <img
                                  src={item.photo}
                                  alt={item.employeeName}
                                  className="w-full rounded-full object-cover outline-2 outline-blue-400 bg-black"
                                />
                              ) : (
                                <AvatarFallback className="bg-gray-300 text-gray-700 font-semibold text-sm">
                                  {getInitials(item.employeeName)}
                                </AvatarFallback>
                              )}
                            </TooltipTrigger>
                            <TooltipContent>{item.employeeName}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Avatar>
                    </DropdownMenuTrigger>

                    {/* {meetingStatus !== "NOT_STARTED" && (
                      <>
                        {item.attendanceMark ? (
                          <DropdownMenuContent>
                            {isTeamLeader && (
                              <DropdownMenuItem
                                onClick={() => handleAddTeamLeader(item)}
                                className="border mb-2"
                              >
                                {item.isTeamLeader
                                  ? "Remove TeamLeader"
                                  : "Add TeamLeader"}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleCheckOut(item.employeeId)}
                              className="border mb-2"
                            >
                              Check Out
                            </DropdownMenuItem>
                            {item.employeeId !== follow &&
                              userId === follow &&
                              follow && (
                                <DropdownMenuItem
                                  onClick={() => handleFollow(item.employeeId)}
                                  className="border"
                                >
                                  Follow
                                </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                        ) : (
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleCheckIn(item.employeeId)}
                              className="border"
                            >
                              Check In
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        )}
                      </>
                    )} */}
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
          {activeTab === "documents" && (
            <div className="px-2">
              <h3 className="mb-2 p-0">Meeting Nots</h3>
              {meetingId && meetingTiming?.employeeList && (
                <MeetingNotes
                  joiners={meetingTiming?.employeeList}
                  meetingId={meetingId}
                  detailMeetingId={meetingTiming?.detailMeetingId}
                  employeeId={userId}
                  className="min-h-[40%] mt-4 max-h-[calc(100vh-200px)] overflow-hidden"
                />
              )}
            </div>
          )}
          {activeTab === "participants" && <div>Participants List</div>}
          {activeTab === "notes" && <div>Meeting Notes</div>}
        </Card>
      </div>
      <div
        className={`${isSidebarCollapsed ? "bg-white border rounded-md" : ""}`}
      >
        <nav className="space-y-1 w-[56px]">
          <Button
            className={`w-full bg-transparent p-0 hover:bg-gray-300 rounded-full text-black justify-start cursor-pointer flex items-center ${isSidebarCollapsed ? "justify-center" : ""}`}
            onClick={() => {
              handleTabChange("joiners");
            }}
          >
            <UsersRound className="" />
          </Button>
          <Button
            className={`w-full bg-transparent hover:bg-gray-300 rounded-full text-black justify-start cursor-pointer flex items-center ${isSidebarCollapsed ? "justify-center p-0" : "p-2"}`}
            onClick={() => handleTabChange("documents")}
          >
            <FileText className="h-6 w-6" />
          </Button>

          {/* New Menu Item 2 - Participants */}
          <Button
            className={`w-full bg-transparent hover:bg-gray-300 rounded-full text-black justify-start cursor-pointer flex items-center ${isSidebarCollapsed ? "justify-center p-0" : "p-2"}`}
            onClick={() => handleTabChange("participants")}
          >
            <Users className="h-6 w-6" />
          </Button>

          {/* New Menu Item 3 - Notes */}
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
