import useMeetingDesc from "./useMeetingDesc";
// import Desc from "../MeetingDesc/Desc/desc";
// import Conclusion from "../MeetingDesc/Conclusion/conclusion";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect } from "react";
import Agenda from "./Agenda";
import { Button } from "@/components/ui/button";
import {
  Crown,
  FileText,
  Notebook,
  Search,
  Users,
  UsersRound,
  X,
} from "lucide-react";
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
    // handleTimeUpdate,
    // handleConclusionMeeting,
    // handleEndMeeting,
  } = useMeetingDesc();
  const { setBreadcrumbs } = useBreadcrumbs();

  const userId = useSelector(getUserId);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Meeting", href: "/dashboard/meeting" },
      { label: "Meeting Detail", href: "" },
      { label: `${meetingTiming?.meetingName}`, href: "" },
    ]);
  }, [meetingTiming?.meetingName, setBreadcrumbs]);

  // let content = null;
  // if (
  //   meetingStatus === "NOT_STARTED" ||
  //   meetingStatus === "STARTED" ||
  //   meetingStatus === "DISCUSSION"
  // ) {
  // content = (
  //   <Agenda
  //     meetingName={meetingTiming?.meetingName ?? ""}
  //     meetingId={meetingId ?? ""}
  //     meetingStatus={meetingStatus}
  //     meetingResponse={meetingResponse}
  //     agendaPlannedTime={meetingTiming?.agendaTimePlanned}
  //     detailMeetingId={meetingTiming?.detailMeetingId}
  //     handleStartMeeting={handleStartMeetingWithSidebar}
  //     handleDesc={handleDesc}
  //     joiners={meetingTiming?.employeeList ?? []}
  //     isPending={isPending}
  //     meetingTime={meetingTiming?.meetingTimePlanned}
  //   />
  // );
  // }
  // } else if (meetingStatus === "DISCUSSION") {
  //   content = (
  //     <Desc
  //       meetingStatus={meetingStatus}
  //       meetingResponse={meetingResponse}
  //       detailMeetingId={meetingTiming?.detailMeetingId}
  //       meetingId={meetingId ?? ""}
  //       joiners={meetingTiming?.employeeList ?? []}
  //     />
  //   );
  // } else if (meetingStatus === "CONCLUSION" || meetingStatus === "ENDED") {
  //   content = (
  //     <Conclusion
  //       meetingStatus={meetingStatus}
  //       meetingResponse={meetingResponse}
  //       detailMeetingId={meetingTiming?.detailMeetingId}
  //     />
  //   );
  // }

  const getInitials = (name: string) => {
    if (!name) return "";
    const names = name.split(" ");
    const firstInitial = names[0]?.charAt(0) || "";
    const secondInitial = names.length > 1 ? names[1]?.charAt(0) || "" : "";
    return (firstInitial + secondInitial).toUpperCase();
  };

  return (
    <div className="flex w-full h-full bg-gray-200 overflow-hidden">
      <div className="w-full bg-white p-4">
        <div className="w-full mt-4">
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
        className={`${isSidebarCollapsed ? "bg-white border rounded-md" : ""}`}
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
