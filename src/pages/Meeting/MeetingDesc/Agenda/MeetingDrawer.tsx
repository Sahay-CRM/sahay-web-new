import {
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";
import MeetingNotes from "./meetingNotes";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelector } from "react-redux";
import { getUserId } from "@/features/selectors/auth.selector";
import useMeetingUi from "./useMeetingUi";
// import { useEffect } from "react";

interface Joiner {
  employeeId: string;
  employeeName: string;
  photo?: string;
  isTeamLeader?: boolean;
  attendanceMark?: boolean;
}

interface MeetingDrawerProps {
  joiners: Joiner[];
  employeeId: string;
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  meetingId: string;
  meetingStart: boolean;
  detailMeetingId?: string;
  follow?: string;
  height?: string;
  show?: boolean; // optional prop, default true
  showToggle?: boolean; // optional prop, default true
  showCrown?: boolean; // optional prop, default true
}

const MeetingDrawer: React.FC<MeetingDrawerProps> = ({
  joiners = [],
  meetingId,
  detailMeetingId,
  employeeId,
  sidebarOpen,
  meetingStart,
  setSidebarOpen,
  follow,
  show = true,
  showToggle = true,
  showCrown = true,
  height,
}) => {
  const { handleAddTeamLeader, handleCheckIn, handleCheckOut, handleFollow } =
    useMeetingUi({ meetingStart, joiners });

  // useEffect(() => {
  //   if (!sidebarOpen) {
  //     setSidebarOpen(true);
  //   }
  // }, []);

  const userId = useSelector(getUserId);
  const isTeamLeader = joiners.some((j) => j.isTeamLeader);

  const getInitials = (name: string) => {
    if (!name) return "";
    const names = name.split(" ");
    const firstInitial = names[0]?.charAt(0) || "";
    const secondInitial = names.length > 1 ? names[1]?.charAt(0) || "" : "";
    return (firstInitial + secondInitial).toUpperCase();
  };

  if (!show) {
    return null;
  }

  return (
    <div
      className="relative mt-4 border rounded-[15px] bg-white shadow-md"
      style={{ height: height, minHeight: "fit-content" }}
    >
      <div
        className={`transition-all  duration-300 overflow-hidden ${
          sidebarOpen ? " w-[350px] p-4 " : "w-[40px] p-2"
        }`}
        style={{
          height: sidebarOpen ? height || "fit-content" : "fit-content",
          maxHeight: sidebarOpen ? height || "fit-content" : "fit-content",
          minHeight: "fit-content",
        }}
      >
        {sidebarOpen ? (
          <Tabs
            defaultValue="attendees"
            className="w-full h-full flex flex-col"
          >
            <div className="flex justify-center">
              <TabsList className="grid w-full grid-cols-2 gap-1 sm:gap-2 text-sm sm:text-base">
                <TabsTrigger
                  value="attendees"
                  className="truncate text-gray-700 data-[state=active]:text-white data-[state=active]:bg-primary"
                >
                  Attendees
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="truncate text-gray-700 data-[state=active]:text-white data-[state=active]:bg-primary"
                >
                  Meeting Notes
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Attendees Tab */}
            <TabsContent
              value="attendees"
              className="mt-4 flex-grow overflow-y-auto"
            >
              <div className=" pb-3">
                <div className="grid grid-cols-6 gap-2">
                  {(joiners || []).map((item, index) => (
                    <div key={index + item.employeeId} className="relative">
                      {/* Crown icon visibility controlled by showCrown prop */}
                      {item.isTeamLeader && showCrown && (
                        <span className="absolute -top-0 right-1 z-10 bg-white shadow-2xl rounded-full p-0.5">
                          <Crown className="w-4 h-4 text-[#303290] drop-shadow" />
                        </span>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild disabled={!meetingStart}>
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
                                <TooltipContent>
                                  {item.employeeName}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Avatar>
                        </DropdownMenuTrigger>

                        {meetingStart && (
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
                                  onClick={() =>
                                    handleCheckOut(item.employeeId)
                                  }
                                  className="border mb-2"
                                >
                                  Check Out
                                </DropdownMenuItem>
                                {item.employeeId !== follow &&
                                  userId === follow &&
                                  follow && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleFollow(item.employeeId)
                                      }
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
                        )}
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent
              value="notes"
              className="mt-4 flex-grow overflow-y-auto"
            >
              <MeetingNotes
                joiners={joiners}
                meetingId={meetingId}
                detailMeetingId={detailMeetingId}
                employeeId={employeeId}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Users className="h-6 w-6 text-gray-600 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>Attendees</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <FileText className="h-6 w-6 text-gray-600 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>Meeting Notes</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* Sidebar Toggle Button - visibility controlled by showToggle prop */}
      {showToggle && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-1 -translate-y-0 -left-4 bg-white border rounded-full p-1 shadow-md hover:bg-gray-100 flex items-center justify-center"
          aria-label="Toggle sidebar"
          style={{ width: 30, height: 30 }}
        >
          {sidebarOpen ? (
            <ChevronRight className="h-5 w-5 text-gray-700" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          )}
        </button>
      )}
    </div>
  );
};

export default MeetingDrawer;
