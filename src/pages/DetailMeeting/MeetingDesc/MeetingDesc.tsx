import React, { Suspense, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  CircleCheckBig,
  Crown,
  EllipsisVertical,
  // FilePlus2,
  FileText,
  NotebookTabs,
  RefreshCcw,
  ThumbsUp,
  Trash2,
  // Unlink,
  UsersRound,
  X,
  MicIcon,
  DownloadIcon,
  Loader2,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

import useMeetingDesc from "./useMeetingDesc";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { getUserDetail } from "@/features/selectors/auth.selector";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatUTCDateToLocal, getInitials } from "@/features/utils/app.utils";
import { ImageBaseURL } from "@/features/utils/urls.utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FormCheckbox from "@/components/shared/Form/FormCheckbox/FormCheckbox";
import { SpinnerIcon } from "@/components/shared/Icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// import FormSelect from "@/components/shared/Form/FormSelect";

const Agenda = React.lazy(() => import("./Agenda"));
const MeetingNotes = React.lazy(() => import("./Agenda/meetingNotes"));
const EmployeeSearchDropdown = React.lazy(
  () => import("./EmployeeSearchDropdown"),
);
const DownloadNotesModal = React.lazy(
  () => import("./Agenda/DownloadNotesModal"),
);

export default function MeetingDesc() {
  const {
    meetingStatus,
    isTranscriptReady,
    handleDownloadTranscript,
    firefliesMeetingId,
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
    // handleDelete,
    handleAddEmp,
    handleDeleteEmp,
    meetingData,
    handleUnFollow,
    handleFollowBack,
    handleRing,
    isShaking,
    isRecording,
    startRecording,
    stopRecording,
    isDownloading,
    recordingUserId,
    userId,
    isMeetingRecording,
    isStop,
    isLoading,
    // selectedGroupFilter,
    // setSelectedGroupFilter,
  } = useMeetingDesc();
  const [isDownloadModalOpen, setIsDownloadModalOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<string | undefined>();
  const [updatesSearchTerm, setUpdatesSearchTerm] = React.useState("");
  const [appreciationSearchTerm, setAppreciationSearchTerm] =
    React.useState("");
  const [isUpdatesSearching, setIsUpdatesSearching] = React.useState(false);
  const [isAppreciationSearching, setIsAppreciationSearching] =
    React.useState(false);

  const handleOpenDownloadModal = (date?: string) => {
    setSelectedDate(date);
    setIsDownloadModalOpen(true);
  };
  const { setBreadcrumbs } = useBreadcrumbs();
  const userDetail = useSelector(getUserDetail);
  const isSuperAdmin = userDetail.isSuperAdmin;
  useEffect(() => {
    setBreadcrumbs([
      { label: "Detail Meeting", href: "/dashboard/meeting/detail" },
      {
        label: `${meetingTiming?.meetingName} `,
        href: "",
        isHighlight: true,
      },
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
  const sidebarItems = [
    { key: "JOINERS", icon: UsersRound, label: " Joiners" },
    { key: "DOCUMENTS", icon: FileText, label: " Notes" },
    { key: "UPDATES", icon: RefreshCcw, label: " Updates" },
    { key: "APPRECIATION", icon: ThumbsUp, label: " Appreciation" },
    // { key: "OLDNOTES", icon: FilePlus2, label: "Old Meeting Notes" },
    { key: "DOCUMENTSTAG", icon: NotebookTabs, label: "Meeting Tag Notes" },
  ];

  const updatesNotes = Array.isArray(meetingNotes?.data)
    ? meetingNotes.data
        .filter((note: MeetingNotesRes) => note.noteType === "UPDATES")
        .filter((note: MeetingNotesRes) =>
          updatesSearchTerm
            ? note.note
                ?.toLowerCase()
                .includes(updatesSearchTerm.toLowerCase()) ||
              note.employeeName
                ?.toLowerCase()
                .includes(updatesSearchTerm.toLowerCase())
            : true,
        )
    : [];

  if (meetingData?.status === 401) {
    return <div>You are Not Authorized</div>;
  }

  return (
    <div className="flex w-full h-full bg-gray-200 overflow-hidden">
      <div
        className={cn(
          "bg-white p-4 flex-1 min-w-0",
          "transition-all duration-300 ease-in-out",
          isShaking && "animate-shake",
        )}
      >
        {/* <audio ref={audioRef} src="/public/BackToWork.mp3" preload="auto" /> */}
        <div className="w-full mt-4 overflow-hidden">
          <Agenda
            meetingName={meetingTiming?.meetingName ?? ""}
            meetingId={meetingId ?? ""}
            meetingStatus={meetingStatus}
            meetingResponse={meetingResponse}
            joiners={meetingTiming?.joiners as Joiners[]}
            meetingTime={meetingTiming?.meetingTimePlanned}
            isTeamLeader={isTeamLeader}
            isSuperAdmin={!!isSuperAdmin}
            isBellRing={handleRing}
            // isCheckIn={
            //   (meetingTiming?.joiners as Joiners[])?.find(
            //     (item) => item.employeeId === userId
            //   )?.attendanceMark
            // }
            follow={meetingResponse?.state.follow === userId}
            stopRecording={stopRecording}
          />
        </div>
      </div>
      <div
        className={cn(
          "h-full rounded-lg mx-3",
          // "transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.5,1)]",
          activeTab !== "" && isCardVisible
            ? "w-[350px] opacity-100"
            : "w-0 opacity-0",
        )}
      >
        <Card className="h-full w-full p-0">
          {activeTab === "JOINERS" && (
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
                {meetingStatus !== "ENDED" &&
                  (isTeamLeader || isSuperAdmin) && (
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
                                  (meetingStatus === "NOT_STARTED" ||
                                    meetingStatus !== "ENDED") &&
                                  (follow === userId ||
                                    isTeamLeader ||
                                    isSuperAdmin)
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
                              (isTeamLeader || isSuperAdmin) && (
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
                                  {(item.employeeId !== userId ||
                                    isSuperAdmin) && (
                                    <div className="flex flex-col gap-2">
                                      {(item.employeeId !== userId ||
                                        isSuperAdmin) && (
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
                                      (isTeamLeader || isSuperAdmin) &&
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
                                      Follow Back to{" "}
                                      {meetingTiming.joiners?.find(
                                        (joiner): joiner is Joiners =>
                                          typeof joiner !== "string" &&
                                          joiner.employeeId ===
                                            meetingResponse?.state.follow,
                                      )?.employeeName || "Unknown"}
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
          {activeTab === "DOCUMENTS" && (
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
                    onPerDateDownload={handleOpenDownloadModal}
                    setIsCardVisible={setIsCardVisible}
                    isCardVisible={isCardVisible}
                    isTopBarShow={true}
                    handleOpenDownloadModal={handleOpenDownloadModal}
                    title="Meeting Notes"
                    // groupFlag={selectedGroupFilter}
                  />
                </Suspense>
              )}
            </div>
          )}
          {activeTab === "DOCUMENTSTAG" && (
            <div>
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
                      FilterBy={"noteTag"}
                      // detailMeetingId={meetingTiming?.detailMeetingId}
                      employeeId={userId}
                      className="mt-2"
                      meetingName={meetingTiming?.meetingName}
                      meetingStatus={meetingStatus}
                      onPerDateDownload={handleOpenDownloadModal}
                      setIsCardVisible={setIsCardVisible}
                      isCardVisible={isCardVisible}
                      handleOpenDownloadModal={handleOpenDownloadModal}
                      isTopBarShow={true}
                      title={"Meeting Tag Notes"}
                      // groupFlag={selectedGroupFilter}
                    />
                  </Suspense>
                )}
              </div>
            </div>
          )}
          {activeTab === "UPDATES" && (
            <div>
              <div className="h-[50px] flex items-center justify-between px-2 py-3 border-b mb-3">
                {isUpdatesSearching ? (
                  <div className="flex-1 flex items-center gap-2 mr-2">
                    <div className="relative w-full">
                      <Search className="absolute left-0 ml-1 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-900" />
                      <Input
                        type="search"
                        placeholder="Search updates..."
                        className="pl-6 h-8 bg-gray-100 border border-black focus-visible:ring-1 placeholder:text-black focus-visible:ring-primary/20 text-sm"
                        value={updatesSearchTerm}
                        onChange={(e) => setUpdatesSearchTerm(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={() => {
                        setIsUpdatesSearching(false);
                        setUpdatesSearchTerm("");
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                ) : (
                  <h3 className="p-0 text-base pl-0">Meeting Updates</h3>
                )}

                <div className="flex gap-2 items-center">
                  {!isUpdatesSearching && (
                    <Search
                      className="w-5 h-5 text-gray-500 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => setIsUpdatesSearching(true)}
                    />
                  )}
                  <X
                    className="w-5 h-5 text-gray-500 cursor-pointer"
                    onClick={() => setIsCardVisible(false)}
                  />
                </div>
              </div>
              <div className="px-3 h-[calc(100vh-215px)] overflow-auto">
                {updatesNotes.map((note: MeetingNotesRes, idx: number) => {
                  return (
                    <div
                      key={note.meetingNoteId || idx}
                      className="flex items-start bg-white rounded-lg border px-3 mb-3 py-2 shadow-sm gap-2"
                    >
                      <div className="flex-1 text-sm text-black">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-xs text-gray-600">
                            {note?.employeeName || "Unknown"}
                          </span>
                          <div>
                            <span className="text-xs text-gray-600 mr-2 bg-gray-200/80 p-0.5 rounded-full px-2">
                              {note.noteType}
                            </span>
                            <span className="text-xs text-gray-400">
                              {note?.createdAt
                                ? new Date(note.createdAt).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )
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
                                      onClick={() => handleUpdateNotes(note)}
                                      className="px-2 py-1.5"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Remove From Updates
                                    </DropdownMenuItem>

                                    {/* <DropdownMenuItem
                                          onClick={() =>
                                            handleDelete(note.meetingNoteId)
                                          }
                                          className="text-red-600 focus:text-red-600 focus:bg-red-50 px-2 py-1.5"
                                        >
                                          <Unlink className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem> */}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {activeTab === "APPRECIATION" && (
            <div>
              <div className="h-[50px] flex items-center justify-between py-3 border-b px-2 mb-3">
                {isAppreciationSearching ? (
                  <div className="flex-1 flex items-center gap-2 mr-2">
                    <div className="relative w-full">
                      <Search className="absolute left-0 ml-1 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-900" />
                      <Input
                        type="search"
                        placeholder="Search appreciation..."
                        className="pl-6 h-8 bg-gray-100 border border-black focus-visible:ring-1 placeholder:text-black focus-visible:ring-primary/20 text-sm"
                        value={appreciationSearchTerm}
                        onChange={(e) =>
                          setAppreciationSearchTerm(e.target.value)
                        }
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={() => {
                        setIsAppreciationSearching(false);
                        setAppreciationSearchTerm("");
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                ) : (
                  <h3 className="p-0 text-base pl-0">Meeting Appreciation</h3>
                )}

                <div className="flex gap-2 items-center">
                  {!isAppreciationSearching && (
                    <Search
                      className="w-5 h-5 text-gray-500 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => setIsAppreciationSearching(true)}
                    />
                  )}
                  <X
                    className="w-5 h-5 text-gray-500 cursor-pointer"
                    onClick={() => setIsCardVisible(false)}
                  />
                </div>
              </div>
              <div className="px-3 h-[calc(100vh-215px)] overflow-auto">
                {Array.isArray(meetingNotes?.data) &&
                  meetingNotes.data
                    .filter((note) => note.noteType === "APPRECIATION")
                    .filter((note: MeetingNotesRes) =>
                      appreciationSearchTerm
                        ? note.note
                            ?.toLowerCase()
                            .includes(appreciationSearchTerm.toLowerCase()) ||
                          note.employeeName
                            ?.toLowerCase()
                            .includes(appreciationSearchTerm.toLowerCase())
                        : true,
                    )
                    .map((note: MeetingNotesRes, idx: number) => {
                      return (
                        <div
                          key={note.meetingNoteId || idx}
                          className="flex items-start bg-white rounded-lg border px-3 mb-3 py-2 shadow-sm gap-2"
                        >
                          <div className="flex-1 text-sm text-black">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-xs text-gray-600">
                                {note?.employeeName || "Unknown"}
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
                                        {/* <DropdownMenuItem
                                          onClick={() =>
                                            handleDelete(note.meetingNoteId)
                                          }
                                          className="text-red-600 focus:text-red-600 focus:bg-red-50 px-2 py-1.5"
                                        >
                                          <Unlink className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem> */}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>
          )}
          {activeTab === "OLDNOTES" && (
            <div>
              <div className="h-[64px] flex items-center justify-between py-3 border-b px-3 mb-3">
                <h3 className="p-0 text-base">Old Meeting Notes</h3>
                <div>
                  <X
                    className="w-5 h-5 text-gray-500 cursor-pointer"
                    onClick={() => setIsCardVisible(false)}
                  />
                </div>
              </div>
              <div className="h-[calc(100vh-180px)] overflow-scroll py-3 border-b px-3 mb-3">
                {Array.isArray(meetingNotes?.data) &&
                  (() => {
                    type GroupedNotes = Record<
                      string,
                      { groupName: string; notes: MeetingNotesRes[] }
                    >;

                    const notesData = meetingNotes?.data as
                      | MeetingNotesRes[]
                      | undefined;
                    const groupedNotes = (notesData || []).reduce<GroupedNotes>(
                      (acc, note) => {
                        const groupKey = note.groupId || "ungrouped";
                        const groupName = note.groupName || "Ungrouped Notes";
                        if (!acc[groupKey])
                          acc[groupKey] = { groupName, notes: [] };
                        acc[groupKey].notes.push(note);
                        return acc;
                      },
                      {},
                    );

                    return (
                      <Accordion
                        type="single"
                        collapsible
                        className="w-full space-y-3"
                      >
                        {Object.entries(groupedNotes).map(
                          ([groupId, groupData], gIdx) => {
                            const filteredNotes = groupData.notes.filter(
                              (item) => item.meetingId !== meetingId,
                            );

                            return (
                              <AccordionItem
                                key={groupId}
                                value={`group-${gIdx}`}
                                className="border rounded-lg shadow-md bg-gray-50"
                              >
                                <AccordionTrigger className="px-3 py-2 font-semibold text-gray-800 bg-gray-100 rounded-t-lg">
                                  {groupData.groupName}
                                </AccordionTrigger>

                                <AccordionContent>
                                  <div className="max-h-[200px] overflow-y-auto pr-1">
                                    <div className="space-y-2 mt-2">
                                      {filteredNotes.map((note, idx) => {
                                        return (
                                          <div
                                            key={note.meetingNoteId || idx}
                                            className="border rounded-lg shadow-sm bg-white"
                                          >
                                            <div className="flex justify-between items-center px-3 py-2 text-left">
                                              <div className="flex flex-col w-full">
                                                <div className="flex justify-between items-center">
                                                  <span className="font-medium text-xs text-gray-700">
                                                    {note?.employeeName ||
                                                      "Unknown"}
                                                  </span>
                                                  <div className="flex items-center gap-2">
                                                    {note.noteType && (
                                                      <span className="text-xs text-gray-600 bg-gray-200/80 px-2 py-0.5 rounded-full">
                                                        {note.noteType}
                                                      </span>
                                                    )}
                                                    <span className="text-xs text-gray-400">
                                                      {formatUTCDateToLocal(
                                                        note.createdAt,
                                                      )}{" "}
                                                      {note?.createdAt
                                                        ? new Date(
                                                            note.createdAt,
                                                          ).toLocaleTimeString(
                                                            [],
                                                            {
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                            },
                                                          )
                                                        : ""}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>

                                            <div className="px-3 py-2 text-sm text-gray-700">
                                              <p className="break-words m-0">
                                                {note.note}
                                              </p>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            );
                          },
                        )}
                      </Accordion>
                    );
                  })()}
              </div>
            </div>
          )}
        </Card>
      </div>

      <Suspense fallback={null}>
        {isDownloadModalOpen && (
          <DownloadNotesModal
            isOpen={isDownloadModalOpen}
            onClose={() => setIsDownloadModalOpen(false)}
            meetingName={meetingTiming?.meetingName || ""}
            meetingDate={
              meetingTiming?.meetingDateTime
                ? formatUTCDateToLocal(meetingTiming.meetingDateTime)
                : ""
            }
            joiners={(meetingTiming?.joiners as Joiners[]) || []}
            meetingId={meetingId!}
            dateFilter={selectedDate}
          />
        )}
      </Suspense>
      <div
        className={`${isSidebarCollapsed ? "bg-white border rounded-md" : ""} flex flex-col z-30`}
      >
        {isLoading ? (
          <div className="flex justify-center items-center"></div>
        ) : (
          <div>
            {meetingStatus !== "NOT_STARTED" &&
              meetingStatus !== "ENDED" &&
              !isMeetingRecording &&
              (userDetail?.employeeType === "CONSULTANT" ||
                userDetail?.employeeType === "SAHAYTEAMMATE") && (
                <div className="flex justify-center ">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={startRecording}
                          variant="outline"
                          disabled={isRecording && userId !== recordingUserId}
                          className={cn(
                            "h-[40px] rounded-[10px] cursor-pointer text-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg",
                            isRecording
                              ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                              : "bg-primary hover:bg-primary/90 text-white",
                          )}
                        >
                          <MicIcon className="w-5 h-5 text-white" />
                        </Button>
                      </TooltipTrigger>

                      <TooltipContent side="right">
                        <p>Start Recording</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
          </div>
        )}
        {meetingStatus &&
          userDetail?.employeeType &&
          meetingStatus !== "NOT_STARTED" &&
          meetingStatus !== "ENDED" &&
          isMeetingRecording === true &&
          (userDetail?.employeeType === "CONSULTANT" ||
            userDetail?.employeeType === "SAHAYTEAMMATE") && (
            <div className="flex justify-center ">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={stopRecording}
                      variant="outline"
                      disabled={
                        isRecording && userId !== recordingUserId && !isStop
                      }
                      className={cn(
                        "h-[40px] rounded-[10px] cursor-pointer text-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg",
                        isRecording
                          ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                          : "bg-primary hover:bg-primary/90 text-white",
                      )}
                    >
                      <MicIcon className="w-5 h-5 text-white" />
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent side="right">
                    <p>Stop Recording</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

        {meetingStatus === "ENDED" &&
          isTranscriptReady === true &&
          firefliesMeetingId &&
          (userDetail?.employeeType === "CONSULTANT" ||
            userDetail?.employeeType === "SAHAYTEAMMATE") && (
            <div className="flex justify-center ">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleDownloadTranscript}
                      variant="outline"
                      className="h-[40px] rounded-[10px] cursor-pointer text-lg font-semibold flex items-center justify-center gap-2 bg-primary hover:bg-primary text-white transition-all duration-300 shadow-lg"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-white" />
                        </>
                      ) : (
                        <DownloadIcon className="w-5 h-5 text-white" />
                      )}
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent side="right">
                    <p>{"Download File"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        <nav className="space-y-1 w-[56px]">
          <TooltipProvider>
            {sidebarItems.map(({ key, icon: Icon, label }) => (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleTabChange(key)}
                    className={`w-full bg-transparent hover:bg-gray-300 rounded-full text-black flex items-center
                ${isSidebarCollapsed ? "justify-center p-0" : "justify-start p-2"}`}
                  >
                    <Icon className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>

                <TooltipContent side="right">
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
      </div>
    </div>
  );
}
