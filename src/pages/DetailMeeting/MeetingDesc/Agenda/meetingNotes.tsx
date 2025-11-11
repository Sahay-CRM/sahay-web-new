import React, { useMemo, useState } from "react";

import {
  Plus,
  EllipsisVertical,
  X,
  Edit,
  Share2,
  Check,
  Tag,
} from "lucide-react";
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
import { useSelector } from "react-redux";
import { getUserId } from "@/features/selectors/auth.selector";
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
  // groupFlag?: boolean | null;
}

interface TaskData {
  [key: string]: string | null;
}

const MeetingNotes: React.FC<MeetingNotesProps> = ({
  joiners,
  employeeId,
  meetingId,
  className,
  meetingName,
  meetingStatus,
  FilterBy,
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
  const [selectedTask, setSelectedTask] = useState<TaskGetPaging | TaskData>();
  const [selectedProject, setSelectedProject] = useState<
    CompanyProjectDataProps | TaskData
  >();

  const userId = useSelector(getUserId);

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

  const isTeamLeader = useMemo(
    () =>
      (joiners as Joiners[])?.some(
        (item) => item.employeeId === userId && item.isTeamLeader,
      ),
    [joiners, userId],
  );

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

      <div
        className={cn(
          " space-y-2 h-[calc(100vh-230px)] overflow-y-scroll ",
          className,
        )}
      >
        {Array.isArray(meetingNotes?.data) &&
          meetingNotes.data
            .filter((note: MeetingNotesRes) =>
              FilterBy ? note.noteTag !== null : note.noteTag === null,
            )
            .map((note: MeetingNotesRes, idx: number) => {
              const author = joiners.find(
                (j) => j.employeeId === note.employeeId,
              );

              return (
                <div
                  key={note.meetingNoteId || idx}
                  className="flex items-start bg-white rounded-lg border px-3 py-2 shadow-sm gap-2"
                >
                  <div className="flex-1 text-sm text-black">
                    <div className="flex justify-between items-baseline ">
                      {note.noteTag && (
                        <div className="flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center px-1 py-0.5 -mt-1 -ml-1.5 rounded-md text-[10px] font-medium bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors">
                            {note.noteTag}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-xs text-gray-600">
                          {author?.employeeName || "Unknown"}
                        </span>
                      </div>
                      <div>
                        {note.noteType && (
                          <span className="text-[10px] text-gray-600 mr-2 bg-gray-200/80 p-0.5 rounded-full px-2">
                            {note.noteType}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatUTCDateToLocal(note.createdAt)}{" "}
                          {note?.createdAt
                            ? new Date(note.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-start gap-2 group">
                      {editingNoteId === note.meetingNoteId ? (
                        <div className="flex-1 relative">
                          <textarea
                            className="w-full border border-gray-300 rounded px-2 py-1 text-black resize-none focus:outline-none focus:border-blue-500"
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            autoFocus
                            rows={expandedNotes[note.meetingNoteId] ? 5 : 2}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmitUpdate(note.meetingNoteId);
                              } else if (e.key === "Escape") {
                                handleCancelEdit();
                              }
                            }}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() =>
                                handleSubmitUpdate(note.meetingNoteId)
                              }
                              className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary flex items-center gap-1"
                            >
                              <Check className="h-3 w-3" />
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 flex items-center gap-1"
                            >
                              <X className="h-3 w-3" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <p
                              className={cn(
                                "break-words whitespace-pre-line text-[12px] text-gray-800 transition-all mt-1 duration-300",
                                !expandedNotes[note.meetingNoteId] &&
                                  "line-clamp-2",
                              )}
                            >
                              {note.note}
                            </p>

                            {/* ✅ Read More / Less */}
                            {note.note?.split("\n").length > 3 ||
                            note.note?.length > 150 ? (
                              <button
                                onClick={() => toggleExpand(note.meetingNoteId)}
                                className="text-xs text-blue-600 hover:underline mt-1"
                              >
                                {expandedNotes[note.meetingNoteId]
                                  ? "Read less"
                                  : "Read more"}
                              </button>
                            ) : null}
                          </div>

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
                                {(note.employeeId === userId ||
                                  isTeamLeader) && (
                                  <button
                                    className="text-gray-500 items-center text-sm w-fit py-1.5 px-2 cursor-pointer"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      toggleDropdown(note.meetingNoteId);
                                    }}
                                  >
                                    <EllipsisVertical className="h-5 w-5" />
                                  </button>
                                )}
                              </DropdownMenuTrigger>

                              <DropdownMenuContent
                                align="end"
                                className="w-full"
                              >
                                <DropdownMenuItem
                                  onClick={() => handleEditNote(note)}
                                  className="px-2 py-1.5"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Update Notes
                                </DropdownMenuItem>
                                {FilterBy === "noteTag" && (
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteTag(note)}
                                    className="px-2 py-1.5"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Delete Tag
                                  </DropdownMenuItem>
                                )}

                                {!note.noteType && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleAddTask(note)}
                                      className="px-2 py-1.5"
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add to Task
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleAddProject(note)}
                                      className="px-2 py-1.5"
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add to Project
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleMarkNotes(note, "updates")
                                      }
                                      className="px-2 py-1.5"
                                    >
                                      <Share2 className="h-4 w-4 mr-2" />
                                      Mark as Updates
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleMarkNotes(note, "appreciation")
                                      }
                                      className="px-2 py-1.5"
                                    >
                                      <Share2 className="h-4 w-4 mr-2" />
                                      Mark as Appreciation
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleMarkNotes(note, "", "KPIs")
                                      }
                                      className="px-2 py-1.5"
                                    >
                                      <Tag className="h-4 w-4 mr-2" />
                                      KPIs
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleMarkNotes(note, "", "Project")
                                      }
                                      className="px-2 py-1.5"
                                    >
                                      <Tag className="h-4 w-4 mr-2" />
                                      Project
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleMarkNotes(note, "", "Task")
                                      }
                                      className="px-2 py-1.5"
                                    >
                                      <Tag className="h-4 w-4 mr-2" />
                                      Task
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
