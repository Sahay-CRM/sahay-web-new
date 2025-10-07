import React, { Suspense, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";

import {
  CircleCheckBig,
  Crown,
  EllipsisVertical,
  FileText,
  RefreshCcw,
  ThumbsUp,
  Trash2,
  Unlink,
  UsersRound,
  X,
} from "lucide-react";

import useMeetingDesc from "./useMeetingDesc";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { getUserId } from "@/features/selectors/auth.selector";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getInitials } from "@/features/utils/app.utils";
import { ImageBaseURL } from "@/features/utils/urls.utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FormCheckbox from "@/components/shared/Form/FormCheckbox/FormCheckbox";
import { SpinnerIcon } from "@/components/shared/Icons";

const Agenda = React.lazy(() => import("./Agenda"));
const MeetingNotes = React.lazy(() => import("./Agenda/meetingNotes"));
const EmployeeSearchDropdown = React.lazy(
  () => import("./EmployeeSearchDropdown"),
);

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
    // handleCheckOut,
    follow,
    handleFollow,
    handleCheckIn,
    meetingNotes,
    handleUpdateNotes,
    dropdownOpen,
    setDropdownOpen,
    handleDelete,
    handleAddEmp,
    handleDeleteEmp,
    meetingData,
    handleUnFollow,
    handleFollowBack,
  } = useMeetingDesc();
  const { setBreadcrumbs } = useBreadcrumbs();

  const userId = useSelector(getUserId);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Detail Meeting", href: "/dashboard/meeting/detail" },
      { label: `${meetingTiming?.meetingName}`, href: "", isHighlight: true },
    ]);
  }, [meetingTiming?.meetingName, setBreadcrumbs]);

  const isTeamLeader = useMemo(
    () =>
      (meetingTiming?.joiners as Joiners[])?.some(
        (item) => item.employeeId === userId && item.isTeamLeader,
      ),
    [meetingTiming?.joiners, userId],
  );

  const teamLeaderCount = useMemo(
    () =>
      (meetingTiming?.joiners as Joiners[])?.filter((emp) => emp.isTeamLeader)
        .length,
    [meetingTiming?.joiners],
  );

  if (meetingData?.status === 401) {
    return <div>You are Not Authorized</div>;
  }

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
            joiners={meetingTiming?.joiners as Joiners[]}
            meetingTime={meetingTiming?.meetingTimePlanned}
            isTeamLeader={isTeamLeader}
            // isCheckIn={
            //   (meetingTiming?.joiners as Joiners[])?.find(
            //     (item) => item.employeeId === userId
            //   )?.attendanceMark
            // }
            follow={meetingResponse?.state.follow === userId}
          />
        </div>
      </div>
      <div
        className={cn(
          "h-full rounded-lg mx-3",
          // "transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.5,1)]",
          isCardVisible ? "w-[350px] opacity-100" : "w-0 opacity-0",
        )}
      >
        <Card className="h-full w-full p-0">
          {activeTab === "joiners" && (
            <div>
              <div className="h-[50px] flex items-center justify-between py-3 border-b px-3 mb-3">
                <h3 className="p-0 text-base pl-4">Meeting Joiners</h3>
                <div className="flex gap-2 items-center">
                  <X
                    className="w-5 h-5 text-gray-500 cursor-pointer"
                    onClick={() => setIsCardVisible(false)}
                  />
                </div>
              </div>
              <div className="h-[calc(100vh-170px)] overflow-auto">
                {meetingStatus !== "ENDED" && isTeamLeader && (
                  <div className="px-4 mb-2">
                    <Suspense
                      fallback={
                        <div className="animate-spin">
                          <SpinnerIcon />
                        </div>
                      }
                    >
                      <EmployeeSearchDropdown
                        onAdd={handleAddEmp}
                        minSearchLength={2}
                        filterProps={{ pageSize: 20 }}
                      />
                    </Suspense>
                  </div>
                )}

                <div className="flex flex-col gap-3 px-3">
                  {meetingTiming &&
                    (meetingTiming?.joiners as Joiners[]).map((item, index) => {
                      const isOpen = openEmployeeId === item.employeeId;
                      const toggleOpen = () => {
                        setOpenEmployeeId(isOpen ? null : item.employeeId);
                      };

                      const unfollowed = Object.keys(
                        meetingResponse?.state?.unfollow || {},
                      );

                      return (
                        <div
                          key={index + item.employeeId}
                          className="rounded-md bg-white shadow-sm p-3"
                        >
                          <div className="flex items-center gap-3 cursor-pointer justify-between">
                            <div
                              className="flex items-center gap-3 cursor-pointer w-full"
                              onClick={() => {
                                if (
                                  meetingStatus === "NOT_STARTED" ||
                                  meetingStatus !== "ENDED"
                                ) {
                                  toggleOpen();
                                }
                              }}
                            >
                              <div className="relative">
                                {item.isTeamLeader && (
                                  <span className="absolute -top-2 right-3 z-10 bg-white shadow-2xl rounded-full p-0.5">
                                    <Crown className="w-3 h-3 text-[#303290] drop-shadow" />
                                  </span>
                                )}

                                <Avatar className="h-10 w-10 relative">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        {item.employeeImage ? (
                                          <img
                                            src={`${ImageBaseURL}/share/profilePics/${item.employeeImage}`}
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
                                {item.employeeId === follow && (
                                  <span className="absolute -bottom-0 right-0 z-10 bg-white shadow-2xl rounded-full p-0.5">
                                    <CircleCheckBig className="w-3 h-3 text-[#303290] drop-shadow" />
                                  </span>
                                )}
                              </div>

                              <div className="text-sm font-medium text-gray-800">
                                {item.employeeName}
                              </div>
                            </div>
                            <div>
                              {meetingStatus !== "NOT_STARTED" && (
                                <FormCheckbox
                                  id={`${item.employeeId}-checkbox`}
                                  className="w-[16px] h-[16px]"
                                  containerClass="p-0 ml-1"
                                  checked={item.attendanceMark as boolean}
                                  onChange={(e) => {
                                    const updatedAttendance = e.target.checked;
                                    handleCheckIn(
                                      item.employeeId,
                                      updatedAttendance,
                                    );
                                  }}
                                  disabled={
                                    meetingStatus === "NOT_STARTED" ||
                                    meetingStatus === "ENDED" ||
                                    !isTeamLeader
                                  }
                                />
                              )}
                            </div>
                            {/* <div> */}
                            {meetingStatus === "NOT_STARTED" &&
                              item.employeeId !== userId &&
                              isTeamLeader && (
                                <Trash2
                                  className="w-6 h-6 mt-1.5"
                                  onClick={() =>
                                    handleDeleteEmp(item.employeeId)
                                  }
                                />
                              )}
                            {/* </div> */}
                          </div>

                          {isOpen &&
                            meetingStatus !== "ENDED" &&
                            follow !== item.employeeId && (
                              <div className="mt-3 pl-12 flex flex-col gap-2">
                                <>
                                  {/* {follow !== item.employeeId && ( */}
                                  {item.employeeId !== userId && (
                                    <div className="flex flex-col gap-2">
                                      {item.employeeId !== userId && (
                                        <>
                                          {!item.isTeamLeader && (
                                            <button
                                              onClick={() =>
                                                handleAddTeamLeader(item)
                                              }
                                              className="text-sm text-left px-3 py-1 border rounded hover:bg-gray-100"
                                            >
                                              Add Team Leader
                                            </button>
                                          )}

                                          {item.isTeamLeader &&
                                            teamLeaderCount > 1 && (
                                              <button
                                                onClick={() =>
                                                  handleAddTeamLeader(item)
                                                }
                                                className="text-sm text-left px-3 py-1 border rounded hover:bg-gray-100"
                                              >
                                                Remove Team Leader
                                              </button>
                                            )}
                                        </>
                                      )}
                                      {meetingStatus !== "NOT_STARTED" &&
                                        item.attendanceMark && (
                                          <>
                                            {/* <button
                                  onClick={() =>
                                    handleCheckOut(item.employeeId)
                                  }
                                  className="text-sm text-left px-3 py-1 border rounded hover:bg-gray-100"
                                >
                                  Check Out
                                </button> */}

                                            {item.isTeamLeader &&
                                              item.employeeId !== follow &&
                                              userId === follow && (
                                                <button
                                                  onClick={() =>
                                                    handleFollow(
                                                      item.employeeId,
                                                    )
                                                  }
                                                  className="text-sm text-left px-3 py-1 border rounded hover:bg-gray-100"
                                                >
                                                  Follow
                                                </button>
                                              )}
                                          </>
                                        )}
                                      {meetingStatus !== "NOT_STARTED" &&
                                        meetingStatus !== "ENDED" &&
                                        follow !== item.employeeId &&
                                        follow !== userId &&
                                        isTeamLeader &&
                                        item.isTeamLeader && (
                                          <button
                                            onClick={() =>
                                              handleFollow(item.employeeId)
                                            }
                                            className="text-sm text-left px-3 py-1 border rounded hover:bg-gray-100"
                                          >
                                            Follow Me Back
                                          </button>
                                        )}
                                    </div>
                                  )}
                                  {/* )} */}
                                  <div className="flex flex-col gap-2">
                                    {follow !== userId &&
                                      follow !== item.employeeId &&
                                      isTeamLeader &&
                                      item.isTeamLeader &&
                                      !unfollowed.includes(userId) &&
                                      meetingStatus !== "NOT_STARTED" &&
                                      meetingStatus !== "ENDED" && (
                                        <button
                                          onClick={() =>
                                            handleUnFollow(item.employeeId)
                                          }
                                          className="text-sm text-left px-3 py-1 border rounded hover:bg-gray-100"
                                        >
                                          UnFollow
                                        </button>
                                      )}
                                  </div>
                                </>
                                {unfollowed.includes(item.employeeId) &&
                                  userId === item.employeeId && (
                                    <button
                                      onClick={() =>
                                        handleFollowBack(item.employeeId)
                                      }
                                      className="text-sm text-left px-3 py-1 border rounded hover:bg-gray-100"
                                    >
                                      Follow Back to {}
                                    </button>
                                  )}
                              </div>
                            )}
                          {/* {isOpen && isTeamLeader && (
                            <>
                              {meetingResponse?.state.unfollow?.[
                                item.employeeId
                              ] && follow ? (
                                <div className="mt-3 pl-12 flex flex-col gap-2">
                                  <button
                                    onClick={() =>
                                      handleUnFollow(item.employeeId)
                                    }
                                    className="text-sm text-left px-3 py-1 border rounded hover:bg-gray-100"
                                  >
                                    UnFollow
                                  </button>
                                </div>
                              ) : (
                                <div className="mt-3 pl-12 flex flex-col gap-2">
                                  <button
                                    onClick={() =>
                                      handleUnFollow(item.employeeId)
                                    }
                                    className="text-sm text-left px-3 py-1 border rounded hover:bg-gray-100"
                                  >
                                    Follow
                                  </button>
                                </div>
                              )}
                            </>
                          )} */}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
          {activeTab === "documents" && (
            <div>
              <div className="h-[50px] flex items-center justify-between py-3 border-b px-3 mb-3">
                <h3 className="p-0 text-base pl-4">Meeting Notes</h3>
                <div>
                  <X
                    className="w-5 h-5 text-gray-500 cursor-pointer"
                    onClick={() => setIsCardVisible(false)}
                  />
                </div>
              </div>
              <div className="px-2">
                {meetingId && (meetingTiming?.joiners as Joiners[]) && (
                  <Suspense
                    fallback={
                      <div className="animate-spin flex w-fit h-fit">
                        <SpinnerIcon />
                      </div>
                    }
                  >
                    <MeetingNotes
                      joiners={meetingTiming?.joiners as Joiners[]}
                      meetingId={meetingId}
                      // detailMeetingId={meetingTiming?.detailMeetingId}
                      employeeId={userId}
                      className="mt-2"
                      meetingName={meetingTiming?.meetingName}
                      meetingStatus={meetingStatus}
                    />
                  </Suspense>
                )}
              </div>
            </div>
          )}
          {activeTab === "updates" && (
            <div>
              <div className="h-[50px] flex items-center justify-between py-3 border-b px-3 mb-3">
                <h3 className="p-0 text-base pl-1">Meeting Updates</h3>
                <div>
                  <X
                    className="w-5 h-5 text-gray-500 cursor-pointer"
                    onClick={() => setIsCardVisible(false)}
                  />
                </div>
              </div>
              <div className="px-3 h-[calc(100vh-170px)] overflow-auto">
                {Array.isArray(meetingNotes?.data) &&
                  meetingNotes.data.map(
                    (note: MeetingNotesRes, idx: number) => {
                      const author = (
                        meetingTiming?.joiners as Joiners[]
                      )?.find((j) => j.employeeId === note.employeeId);

                      return (
                        <div
                          key={note.meetingNoteId || idx}
                          className="flex items-start bg-white rounded-lg border px-3 mb-3 py-2 shadow-sm gap-2"
                        >
                          <div className="flex-1 text-sm text-black">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-xs text-gray-600">
                                {author?.employeeName || "Unknown"}
                              </span>
                              <div>
                                <span className="text-xs text-gray-600 mr-2 bg-gray-200/80 p-0.5 rounded-full px-2">
                                  {note.noteType}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {note?.createdAt
                                    ? new Date(
                                        note.createdAt,
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between items-start gap-2 group">
                              <p className="break-words">{note.note}</p>
                              {meetingStatus !== "NOT_STARTED" &&
                                meetingStatus !== "ENDED" && (
                                  <div>
                                    <DropdownMenu
                                      open={dropdownOpen === note.meetingNoteId}
                                      onOpenChange={(open) =>
                                        setDropdownOpen(
                                          open ? note.meetingNoteId : null,
                                        )
                                      }
                                    >
                                      <DropdownMenuTrigger asChild>
                                        <button
                                          onClick={() =>
                                            setDropdownOpen(note.meetingNoteId)
                                          }
                                          className="text-gray-500 items-center text-sm w-fit py-1.5 px-2"
                                        >
                                          <EllipsisVertical className="h-5 w-5" />
                                        </button>
                                      </DropdownMenuTrigger>

                                      <DropdownMenuContent
                                        align="end"
                                        className="w-full"
                                      >
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleUpdateNotes(note)
                                          }
                                          className="px-2 py-1.5"
                                        >
                                          <X className="h-4 w-4 mr-2" />
                                          Remove From Updates
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleDelete(note.meetingNoteId)
                                          }
                                          className="text-red-600 focus:text-red-600 focus:bg-red-50 px-2 py-1.5"
                                        >
                                          <Unlink className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
              </div>
            </div>
          )}
          {activeTab === "appreciation" && (
            <div>
              <div className="h-[64px] flex items-center justify-between py-3 border-b px-3 mb-3">
                <h3 className="p-0 text-base">Meeting Appreciation</h3>
                <div>
                  <X
                    className="w-5 h-5 text-gray-500 cursor-pointer"
                    onClick={() => setIsCardVisible(false)}
                  />
                </div>
              </div>
              <div className="px-3 h-[calc(100vh-170px)] overflow-auto">
                {Array.isArray(meetingNotes?.data) &&
                  meetingNotes.data.map(
                    (note: MeetingNotesRes, idx: number) => {
                      const author = (
                        meetingTiming?.joiners as Joiners[]
                      )?.find((j) => j.employeeId === note.employeeId);

                      return (
                        <div
                          key={note.meetingNoteId || idx}
                          className="flex items-start bg-white rounded-lg border px-3 mb-3 py-2 shadow-sm gap-2"
                        >
                          <div className="flex-1 text-sm text-black">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-xs text-gray-600">
                                {author?.employeeName || "Unknown"}
                              </span>
                              <div>
                                <span className="text-xs text-gray-600 mr-2 bg-gray-200/80 p-0.5 rounded-full px-2">
                                  {note.noteType}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {note?.createdAt
                                    ? new Date(
                                        note.createdAt,
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between items-start gap-2 group">
                              <p className="break-words">{note.note}</p>
                              {meetingStatus !== "NOT_STARTED" &&
                                meetingStatus !== "ENDED" && (
                                  <div>
                                    <DropdownMenu
                                      open={dropdownOpen === note.meetingNoteId}
                                      onOpenChange={(open) =>
                                        setDropdownOpen(
                                          open ? note.meetingNoteId : null,
                                        )
                                      }
                                    >
                                      <DropdownMenuTrigger asChild>
                                        <button
                                          onClick={() =>
                                            setDropdownOpen(note.meetingNoteId)
                                          }
                                          className="text-gray-500 items-center text-sm w-fit py-1.5 px-2"
                                        >
                                          <EllipsisVertical className="h-5 w-5" />
                                        </button>
                                      </DropdownMenuTrigger>

                                      <DropdownMenuContent
                                        align="end"
                                        className="w-full"
                                      >
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleUpdateNotes(note)
                                          }
                                          className="px-2 py-1.5"
                                        >
                                          <X className="h-4 w-4 mr-2" />
                                          Remove From Appreciation
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleDelete(note.meetingNoteId)
                                          }
                                          className="text-red-600 focus:text-red-600 focus:bg-red-50 px-2 py-1.5"
                                        >
                                          <Unlink className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
              </div>
            </div>
          )}
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
            onClick={() => handleTabChange("updates")}
          >
            <RefreshCcw className="h-6 w-6" />
          </Button>

          <Button
            className={`w-full bg-transparent hover:bg-gray-300 rounded-full text-black justify-start cursor-pointer flex items-center ${isSidebarCollapsed ? "justify-center p-0" : "p-2"}`}
            onClick={() => handleTabChange("appreciation")}
          >
            <ThumbsUp className="h-6 w-6" />
          </Button>
        </nav>
      </div>
    </div>
  );
}
