import React, { useEffect, useRef, useState } from "react";

import {
  Plus,
  EllipsisVertical,
  X,
  Edit,
  Share2,
  Tag,
  Check,
  Download,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import TaskDrawer from "../Tasks/taskDrawer";
import ProjectDrawer from "../Projects/projectDrawer";
import {
  addMeetingNotesMutation,
  // deleteCompanyMeetingMutation,
  useGetMeetingNotes,
} from "@/features/api/detailMeeting";
import { get, ref, update } from "firebase/database";
import { queryClient } from "@/queryClient";
// import { useSelector } from "react-redux";
// import { getUserId } from "@/features/selectors/auth.selector";
import { database } from "@/firebaseConfig";
import { formatUTCDateToLocal } from "@/features/utils/app.utils";
import { removeTagFromnote } from "@/features/api/detailMeeting/NoteGroup";
// import NotesGroupModal from "./notesGroupModal";
// import ConfirmUnGroupModal from "./confirmUnGroupModal";
// import { removeGroupMutation } from "@/features/api/detailMeeting/NoteGroup";
// import MoveDeleteGroupModal from "./moveDeleteGroupModal";

interface MeetingNotesProps {
  joiners: Joiners[];
  employeeId: string;
  meetingId: string;
  className?: string;
  meetingName?: string;
  meetingStatus?: string;
  FilterBy?: string;
  onPerDateDownload?: (date?: string) => void;
  // groupFlag?: boolean | null;
}

interface TaskData {
  [key: string]: string | null;
}

const MeetingNotes: React.FC<MeetingNotesProps> = ({
  // joiners,
  employeeId,
  meetingId,
  className,
  meetingName,
  meetingStatus,
  FilterBy,
  onPerDateDownload,
  // groupFlag,
}) => {
  const [noteInput, setNoteInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerProj, setDrawerProj] = useState(false);
  // const [isGroupModal, setIsGroupModal] = useState(false);
  // const [isUpdateName, setIsUpdateName] = useState(false);
  // const [GroupModalData, setGroupModalData] = useState<MeetingNotesRes | null>(
  //   null,
  // );
  // const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  // const [selectedUnGroupNote, setSelectedUnGroupNote] =
  //   useState<MeetingNotesRes | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState<TaskGetPaging | TaskData>();
  const [selectedProject, setSelectedProject] = useState<
    CompanyProjectDataProps | TaskData
  >();

  // const userId = useSelector(getUserId);

  // New states for editing notes
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  const deleteTagMutation = removeTagFromnote();
  const db = database;

  const meetingRef = ref(db, `meetings/${meetingId}`);

  const { data: meetingNotes, refetch: refetchMeetingNotes } =
    useGetMeetingNotes({
      filter: {
        meetingId: meetingId,
        // groupFlag,
      },
      enable: !!meetingId,
    });
  const { mutate: addNote } = addMeetingNotesMutation();
  // const { mutate: removeGroupFromNote } = removeGroupMutation();
  // const deleteNoteMutation = deleteCompanyMeetingMutation();

  // Toggle dropdown function
  const toggleDropdown = (noteId: string) => {
    setDropdownOpen(dropdownOpen === noteId ? null : noteId);
  };

  // const handleDelete = (id: string) => {
  //   deleteNoteMutation.mutate(id, {
  //     onSuccess: async () => {
  //       const meetingSnapshot = await get(meetingRef);
  //       if (!meetingSnapshot.exists()) {
  //         queryClient.invalidateQueries({
  //           queryKey: ["get-meeting-notes"],
  //         });
  //         return;
  //       } else {
  //         update(ref(db, `meetings/${meetingId}/state`), {
  //           updatedAt: Date.now(),
  //         });
  //       }
  //     },
  //   });
  //   setDropdownOpen(null); // Close dropdown after action
  // };

  const handleAddTask = (data: MeetingNotesRes) => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 15);

    const payload = {
      taskName: data.note,
      taskDescription: `${data.note} created in ${meetingName}`,
      taskDeadline: deadline.toISOString(),
      meetingNoteId: data.meetingNoteId,
    };
    setSelectedTask(payload);
    setDrawerOpen(true);
    setDropdownOpen(null); // Close dropdown after action
  };

  const handleAddProject = (data: MeetingNotesRes) => {
    const payload = {
      projectName: data.note,
      projectDescription: `${data.note} created in ${meetingName}`,
      meetingNoteId: data.meetingNoteId,
    };
    setSelectedProject(payload);
    setDrawerProj(true);
    setDropdownOpen(null); // Close dropdown after action
  };

  const handleMarkNotes = (
    data: MeetingNotesRes,
    type?: string,
    tag?: string,
  ) => {
    const payload = {
      meetingId,
      employeeId,
      note: data.note,
      noteType: type?.toUpperCase(),
      meetingNoteId: data.meetingNoteId,
      noteTag: tag,
    };
    addNote(payload, {
      onSuccess: async () => {
        if (meetingStatus === "NOT_STARTED" || meetingStatus === "ENDED") {
          queryClient.invalidateQueries({
            queryKey: ["get-meeting-notes"],
          });
          refetchMeetingNotes();
          setDropdownOpen(null);
        } else {
          const meetingSnapshot = await get(meetingRef);
          if (!meetingSnapshot.exists()) {
            queryClient.invalidateQueries({
              queryKey: ["get-meeting-notes"],
            });
            refetchMeetingNotes();
            setDropdownOpen(null);
            return;
          } else {
            update(ref(db, `meetings/${meetingId}/state`), {
              updatedAt: Date.now(),
            });
            refetchMeetingNotes();
            setDropdownOpen(null);
          }
        }
      },
    });
  };

  // New function to handle note editing
  const handleEditNote = (note: MeetingNotesRes) => {
    setEditingNoteId(note.meetingNoteId);
    setEditingNoteText(note.note);
    setDropdownOpen(null); // Close dropdown when editing starts
  };
  const handleDeleteTag = (note: MeetingNotesRes) => {
    deleteTagMutation.mutate(note.noteId!);
  };

  // New function to submit the updated note
  const handleSubmitUpdate = (noteId: string) => {
    const payload = {
      meetingId,
      employeeId,
      note: editingNoteText,
      meetingNoteId: noteId,
    };

    addNote(payload, {
      onSuccess: async () => {
        if (meetingStatus === "NOT_STARTED" || meetingStatus === "ENDED") {
          queryClient.invalidateQueries({
            queryKey: ["get-meeting-notes"],
          });
          refetchMeetingNotes();
          setEditingNoteId(null);
          setEditingNoteText("");
        } else {
          const meetingSnapshot = await get(meetingRef);
          if (!meetingSnapshot.exists()) {
            queryClient.invalidateQueries({
              queryKey: ["get-meeting-notes"],
            });
            refetchMeetingNotes();
            setEditingNoteId(null);
            setEditingNoteText("");
            return;
          } else {
            update(ref(db, `meetings/${meetingId}/state`), {
              updatedAt: Date.now(),
            });
            refetchMeetingNotes();
            setEditingNoteId(null);
            setEditingNoteText("");
          }
        }
      },
    });
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingNoteText("");
  };

  const handleStartAddNote = () => {
    setIsAddingNote(true);
  };

  const handleAddNote = () => {
    const payload = {
      meetingId,
      employeeId,
      title: titleInput,
      note: noteInput,
      createdAt: new Date().toISOString(),
    };

    addNote(payload, {
      onSuccess: async () => {
        if (meetingStatus === "NOT_STARTED" || meetingStatus === "ENDED") {
          queryClient.invalidateQueries({
            queryKey: ["get-meeting-notes"],
          });
          refetchMeetingNotes();
          setTitleInput("");
          setNoteInput("");
          setIsAddingNote(false);
        } else {
          const meetingSnapshot = await get(meetingRef);
          if (!meetingSnapshot.exists()) {
            queryClient.invalidateQueries({
              queryKey: ["get-meeting-notes"],
            });
            refetchMeetingNotes();
            setTitleInput("");
            setNoteInput("");
            setIsAddingNote(false);
            return;
          } else {
            update(ref(db, `meetings/${meetingId}/state`), {
              updatedAt: Date.now(),
            });
            refetchMeetingNotes();
            setTitleInput("");
            setNoteInput("");
            setIsAddingNote(false);
          }
        }
      },
    });
  };

  // const isTeamLeader = useMemo(
  //   () =>
  //     (joiners as Joiners[])?.some(
  //       (item) => item.employeeId === userId && item.isTeamLeader
  //     ),
  //   [joiners, userId]
  // );

  const [expandedNotes, setExpandedNotes] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleExpand = (id: string | number) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  // const handleConfirmUnGroup = () => {
  //   if (!selectedUnGroupNote?.groupId) return;

  //   const payload = {
  //     groupId: selectedUnGroupNote.groupId,
  //     meetingNoteId: selectedUnGroupNote.meetingNoteId,
  //   };

  //   removeGroupFromNote(payload, {
  //     onSuccess: () => {
  //       setIsConfirmModalOpen(false);
  //       refetchMeetingNotes();
  //     },
  //   });
  // };

  // const handleNoteGroup = (data: MeetingNotesRes) => {
  //   setIsGroupModal(true);
  //   setIsUpdateName(false);
  //   setGroupModalData(data);
  // };
  // const handleUpdateGroup = (data: MeetingNotesRes) => {
  //   setIsGroupModal(true);
  //   setIsUpdateName(true);
  //   setGroupModalData(data);
  // };

  // const handleUnGroupGroup = (note: MeetingNotesRes) => {
  //   setSelectedUnGroupNote(note);
  //   setIsConfirmModalOpen(true);
  // };

  const [showToggle, setShowToggle] = useState<{ [key: string]: boolean }>({});

  const textRefs = useRef<{ [key: string]: HTMLParagraphElement | null }>({});

  useEffect(() => {
    if (!Array.isArray(meetingNotes?.data)) return; // ✅ ensure array

    const newShowToggles: { [key: string]: boolean } = {};

    meetingNotes.data.forEach((note: MeetingNotesRes) => {
      const el = textRefs.current[note.meetingNoteId];
      if (el && el.scrollHeight > el.clientHeight) {
        newShowToggles[note.meetingNoteId] = true;
      }
    });

    setShowToggle(newShowToggles);
  }, [meetingNotes]);

  return (
    <div className={cn("px-2", className)}>
      {meetingStatus !== "ENDED" && FilterBy !== "noteTag" && (
        <>
          {!isAddingNote ? (
            <div className="flex items-center gap-2">
              <div className="relative w-full flex gap-2 justify-between">
                <button
                  onClick={handleStartAddNote}
                  className="text-gray-500 hover:bg-gray-100 rounded-full flex gap-3 items-center mr-2 text-sm w-full py-2 px-2 "
                >
                  <Plus className="h-5 w-5" /> Take a Note...
                </button>
                <button
                  onClick={handleStartAddNote}
                  className="text-gray-500 hover:bg-gray-100 rounded-full flex gap-3 items-center mr-2 text-sm w-fit py-1.5 px-2 "
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border px-3 py-2 shadow-sm relative">
              <textarea
                className="w-[80%] border-none text-black px-0 pr-1 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                placeholder="Take a note..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                autoFocus
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (noteInput.trim() === "") {
                      return;
                    }

                    handleAddNote();
                  }
                }}
              />

              <div className="flex justify-end items-center mt-2">
                <button
                  onClick={() => {
                    if (noteInput.trim() === "") {
                      return;
                    }
                    handleAddNote();
                  }}
                  className="text-sm text-gray-600 cursor-pointer flex flex-col"
                >
                  Done
                </button>
              </div>
              <div className="absolute top-2 right-2 flex items-center">
                <X
                  className="w-5 h-5 text-gray-500 cursor-pointer"
                  onClick={() => setIsAddingNote(false)}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Local Search Input */}
      <div className="relative mt-3 mb-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search notes..."
          className="pl-9 h-9 bg-white border-gray-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={cn("h-[calc(100vh-280px)] overflow-y-scroll", className)}>
        {Array.isArray(meetingNotes?.data) &&
          (() => {
            // Filter and sort notes
            const filteredNotes = [...meetingNotes.data]
              .filter((note: MeetingNotesRes) =>
                FilterBy ? note.noteTag !== null : note.noteTag === null,
              )
              .filter((note: MeetingNotesRes) =>
                searchTerm
                  ? note.note
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    note.employeeName
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    note.noteTag
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  : true,
              )
              .sort((a, b) => {
                if (meetingStatus === "ENDED") {
                  // DESC — newest first
                  return (
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                  );
                }
                return 0; // keep original order for all other statuses
              });

            // Group notes by date (without time)
            const groupedByDate = filteredNotes.reduce(
              (
                groups: { [key: string]: MeetingNotesRes[] },
                note: MeetingNotesRes,
              ) => {
                const dateKey = formatUTCDateToLocal(note.createdAt);
                if (!groups[dateKey]) {
                  groups[dateKey] = [];
                }
                groups[dateKey].push(note);
                return groups;
              },
              {},
            );

            // Get sorted date keys
            const dateKeys = Object.keys(groupedByDate).sort((a, b) => {
              // Sort dates in descending order (newest first)
              const dateA = new Date(groupedByDate[a][0].createdAt).getTime();
              const dateB = new Date(groupedByDate[b][0].createdAt).getTime();
              return dateB - dateA;
            });

            return dateKeys.map((dateKey, groupIdx) => (
              <div key={dateKey} className="mb-6">
                {/* Date Header */}
                <div className="sticky top-0 bg-gray-50 border-b-2 border-primary/20 px-3 py-2 mb-3 rounded-t-lg z-10 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-700">
                    {dateKey}
                  </h3>
                  <Download
                    className="w-4 h-4 text-gray-500 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => onPerDateDownload?.(dateKey)}
                  />
                </div>

                {/* Notes for this date */}
                <div className="space-y-2 px-1">
                  {groupedByDate[dateKey].map(
                    (note: MeetingNotesRes, idx: number) => (
                      <div
                        key={note.meetingNoteId || idx}
                        className="bg-white border rounded-lg px-1.5 py-2.5 shadow-sm space-y-2"
                      >
                        {/* TOP ROW */}
                        <div className="flex h-3.5 justify-between items-start">
                          {/* LEFT: EMPLOYEE NAME */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-600 mt-0.5">
                              {note.employeeName || "Unknown"}
                            </span>
                          </div>

                          {/* RIGHT: TIME + MENU (removed date since it's in the header) */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-gray-400">
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

                            {/* MENU */}
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
                                  className="text-gray-500 p-1 hover:bg-gray-100 rounded-md"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleDropdown(note.meetingNoteId);
                                  }}
                                >
                                  <EllipsisVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                  onClick={() => handleEditNote(note)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Update Notes
                                </DropdownMenuItem>

                                {FilterBy === "noteTag" && (
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteTag(note)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Delete Tag
                                  </DropdownMenuItem>
                                )}

                                {!note.noteType && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleAddTask(note)}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add to Task
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() => handleAddProject(note)}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add to Project
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleMarkNotes(note, "updates")
                                      }
                                    >
                                      <Share2 className="h-4 w-4 mr-2" />
                                      Mark as Updates
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleMarkNotes(note, "appreciation")
                                      }
                                    >
                                      <Share2 className="h-4 w-4 mr-2" />
                                      Mark as Appreciation
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleMarkNotes(note, "", "KPIs")
                                      }
                                    >
                                      <Tag className="h-4 w-4 mr-2" />
                                      KPIs
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleMarkNotes(note, "", "Project")
                                      }
                                    >
                                      <Tag className="h-4 w-4 mr-2" />
                                      Project
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleMarkNotes(note, "", "Task")
                                      }
                                    >
                                      <Tag className="h-4 w-4 mr-2" />
                                      Task
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleMarkNotes(note, "", "Reminder")
                                      }
                                    >
                                      <Tag className="h-4 w-4 mr-2" />
                                      Reminder
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* NOTE TEXT */}
                        <div>
                          {editingNoteId === note.meetingNoteId ? (
                            <div className="flex-1">
                              <textarea
                                className="w-full border rounded-md px-2 py-1 text-black text-sm resize-none focus:ring-1 focus:ring-primary/40"
                                value={editingNoteText}
                                onChange={(e) =>
                                  setEditingNoteText(e.target.value)
                                }
                                rows={expandedNotes[note.meetingNoteId] ? 5 : 2}
                                autoFocus
                              />
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() =>
                                    handleSubmitUpdate(note.meetingNoteId)
                                  }
                                  className=" flex items-center  gap-1 text-xs bg-primary text-white px-2 py-1 rounded-md"
                                >
                                  <Check className="h-3 w-3" />
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="flex items-center  gap-1  text-xs bg-gray-500 text-white px-2 py-1 rounded-md"
                                >
                                  <X className="h-3 w-3" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p
                                ref={(el) => {
                                  textRefs.current[note.meetingNoteId] = el;
                                }}
                                className={cn(
                                  "text-[12px] text-gray-800 leading-normal whitespace-pre-line",
                                  !expandedNotes[note.meetingNoteId] &&
                                    "line-clamp-2",
                                )}
                              >
                                {note.note}
                              </p>

                              {showToggle[note.meetingNoteId] && (
                                <button
                                  className="text-primary text-[12px] mt-1"
                                  onClick={() =>
                                    toggleExpand(note.meetingNoteId)
                                  }
                                >
                                  {expandedNotes[note.meetingNoteId]
                                    ? "See less"
                                    : "See more"}
                                </button>
                              )}
                            </>
                          )}
                        </div>

                        {/* FOOTER TAGS */}
                        {(note.noteTag || note.noteType) && (
                          <div className="pt-1 border-t flex items-center gap-2 flex-wrap">
                            {note.noteTag && (
                              <span className="px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary border border-primary/30">
                                {note.noteTag}
                              </span>
                            )}

                            {note.noteType && (
                              <span className="px-2 py-0.5 text-[10px] bg-gray-200 rounded-full text-gray-700">
                                {note.noteType}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>

                {/* Date Group Separator - visible border between different date groups */}
                {groupIdx < dateKeys.length - 1 && (
                  <div className="mt-4 border-b-2 border-dashed border-gray-300"></div>
                )}
              </div>
            ));
          })()}
      </div>

      {drawerOpen && (
        <TaskDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          taskData={selectedTask as TaskGetPaging}
          tasksFireBase={function (): void {
            // eslint-disable-next-line no-console
            console.error("Function not implemented.");
          }}
        />
      )}
      {drawerProj && (
        <ProjectDrawer
          open={drawerProj}
          onClose={() => setDrawerProj(false)}
          projectData={selectedProject as CompanyProjectDataProps}
          projectsFireBase={function (): void {
            // eslint-disable-next-line no-console
            console.error("Function not implemented.");
          }}
        />
      )}

      {/* {isGroupModal && (
        <NotesGroupModal
          isModalOpen={isGroupModal}
          modalClose={() => setIsGroupModal(false)}
          meetingNoteData={GroupModalData!}
          isUpdateName={isUpdateName}
        />
      )} */}

      {/* <ConfirmUnGroupModal
        isOpen={isConfirmModalOpen}
        modalClose={() => setIsConfirmModalOpen(false)}
        title="Ungroup Note"
        message="Are you sure you want to remove this note from its group?"
        onConfirm={handleConfirmUnGroup}
        confirmText="Yes, Ungroup"
        cancelText="Cancel"
      /> */}
    </div>
  );
};

export default MeetingNotes;
