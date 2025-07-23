// src/components/MeetingDrawer.tsx

import { Users, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import MeetingNotes from "./meetingNotes"; // Ensure this path is correct
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Import Shadcn UI Tabs components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Joiner {
  employeeId: string;
  employeeName: string;
  photo?: string;
}

interface MeetingDrawerProps {
  joiners: Joiner[];
  employeeId: string;
  sidebarOpen: boolean;
  meetingId: string;
  detailMeetingId?: string;
  setSidebarOpen: (isOpen: boolean) => void;
}

const MeetingDrawer: React.FC<MeetingDrawerProps> = ({
  joiners = [],
  meetingId,
  detailMeetingId,
  employeeId,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const getInitials = (name: string) => {
    if (!name) return "";
    const names = name.split(" ");
    const firstInitial = names[0]?.charAt(0) || "";
    const secondInitial = names.length > 1 ? names[1]?.charAt(0) || "" : "";
    return (firstInitial + secondInitial).toUpperCase();
  };
  //   const dummyJoiners = Array.from({ length: 100 }, (_, i) => ({
  //     employeeId: `emp-${i + 1}`,
  //     employeeName: `Employee ${i + 1}`,
  //     photo: "", // koi photo nahi, initials show honge
  //   }));
  return (
    <div
      className="relative mt-4 border rounded-[15px] bg-white shadow-md"
      style={{ height: "fit-content", minHeight: "fit-content" }}
    >
      {/* INNER content div — width and padding toggle */}
      <div
        className={`transition-all duration-300 overflow-hidden
          ${sidebarOpen ? "w-[350px] p-4" : "w-[60px] p-2"}`}
      >
        {sidebarOpen ? (
          // Use Shadcn UI Tabs when sidebar is open
          <Tabs
            defaultValue="attendees"
            className="w-full h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="attendees">Attendees</TabsTrigger>
              <TabsTrigger value="notes">Meeting Notes</TabsTrigger>
            </TabsList>

            <TabsContent
              value="attendees"
              className="mt-4 flex-grow overflow-y-auto"
            >
              {/* Attendees Box - Adjusted height to fit within tab content */}
              {/* <div className="border rounded-[15px] p-4 flex-grow">  */}
              {/* <h3 className="font-semibold mb-2">Attendees</h3> */}
              <div className="max-h-[600px] overflow-y-auto p-2 border rounded-md">
                <div className="flex flex-wrap gap-2">
                  {joiners.map((item) => (
                    <div key={item.employeeId}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="h-8 w-8">
                              {item.photo ? (
                                <img
                                  src={item.photo}
                                  alt={item.employeeName}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <AvatarFallback className="bg-gray-300 text-gray-700 font-semibold text-sm">
                                  {getInitials(item.employeeName)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>{item.employeeName}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              </div>

              {/* </div> */}
            </TabsContent>

            <TabsContent
              value="notes"
              className="mt-4 flex-grow overflow-y-auto"
            >
              {/* Meeting Notes */}
              <MeetingNotes
                joiners={joiners}
                meetingId={meetingId}
                detailMeetingId={detailMeetingId}
                employeeId={employeeId}
              />
            </TabsContent>
          </Tabs>
        ) : (
          // Collapsed state remains the same
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

      {/* Toggle button positioned OUTSIDE the outer border (top-left corner) */}
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
    </div>
  );
};

export default MeetingDrawer;
