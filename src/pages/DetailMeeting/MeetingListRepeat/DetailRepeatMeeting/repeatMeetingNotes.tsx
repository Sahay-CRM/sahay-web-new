import React, { useState } from "react";

import {
  Unlink,
  Plus,
  EllipsisVertical,
  X,
  Edit,
  Share2,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { get, ref, update } from "firebase/database";
import { database } from "@/firebaseConfig";
import { queryClient } from "@/queryClient";
import {
  addRepeatMeetingNotesMutation,
  deleteRepeatCompanyMeetingMutation,
  useGetRepeatMeetingNotes,
} from "@/features/api/RepeatMeetingApi";

interface MeetingNotesProps {
  joiners: Joiners[];
  employeeId: string;
  repetitiveMeetingId: string;
  className?: string;
  meetingName?: string;
  meetingStatus?: string;
}

// interface TaskData {
//   [key: string]: string | null;
// }

const RepeatMeetingNotes: React.FC<MeetingNotesProps> = ({
  // joiners,
  employeeId,
  repetitiveMeetingId,
  className,
  // meetingName,
  meetingStatus,
}) => {
  const [noteInput, setNoteInput] = useState("");
  // const [titleInput, setTitleInput] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  // const [drawerOpen, setDrawerOpen] = useState(false);
  // const [drawerProj, setDrawerProj] = useState(false);
  // const [selectedTask, setSelectedTask] = useState<TaskGetPaging | TaskData>();
  // const [selectedProject, setSelectedProject] = useState<
  //   CompanyProjectDataProps | TaskData
  // >();

  // New states for editing notes
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  const db = database;

  const meetingRef = ref(db, `meetings/${repetitiveMeetingId}`);

  const { data: meetingNotes, refetch: refetchMeetingNotes } =
    useGetRepeatMeetingNotes({
      filter: {
        repetitiveMeetingId: repetitiveMeetingId,
      },
      enable: !!repetitiveMeetingId,
    });
  const { mutate: addNote } = addRepeatMeetingNotesMutation();
  const deleteNoteMutation = deleteRepeatCompanyMeetingMutation();

  // Toggle dropdown function
  const toggleDropdown = (noteId: string) => {
    setDropdownOpen(dropdownOpen === noteId ? null : noteId);
  };

  const handleDelete = (id: string) => {
    deleteNoteMutation.mutate(id, {
      onSuccess: async () => {
        const meetingSnapshot = await get(meetingRef);
        if (!meetingSnapshot.exists()) {
          queryClient.invalidateQueries({
            queryKey: ["get-meeting-notes"],
          });
          return;
        } else {
          update(ref(db, `meetings/${repetitiveMeetingId}/state`), {
            updatedAt: Date.now(),
          });
        }
      },
    });
    setDropdownOpen(null); // Close dropdown after action
  };

  // const handleAddTask = (data: RepeatMeetingNotesRes) => {
  //   const deadline = new Date();
  //   deadline.setDate(deadline.getDate() + 15);

  //   const payload = {
  //     taskName: data.note,
  //     taskDescription: `${data.note} created in ${meetingName}`,
  //     taskDeadline: deadline.toISOString(),
  //     noteId: data.noteId,
  //   };
  //   setSelectedTask(payload);
  //   setDrawerOpen(true);
  //   setDropdownOpen(null); // Close dropdown after action
  // };

  // const handleAddProject = (data: RepeatMeetingNotesRes) => {
  //   const payload = {
  //     projectName: data.note,
  //     projectDescription: `${data.note} created in ${meetingName}`,
  //     noteId: data.noteId,
  //   };
  //   setSelectedProject(payload);
  //   setDrawerProj(true);
  //   setDropdownOpen(null); // Close dropdown after action
  // };

  const handleMarkNotes = (data: RepeatMeetingNotesRes, type: string) => {
    const payload = {
      repetitiveMeetingId,
      employeeId,
      note: data.note,
      noteType: type.toUpperCase(),
      noteId: data.noteId,
    };
    addNote(payload, {
      onSuccess: async () => {
        const meetingSnapshot = await get(meetingRef);
        if (!meetingSnapshot.exists()) {
          queryClient.invalidateQueries({
            queryKey: ["get-meeting-notes"],
          });
          refetchMeetingNotes();
          setDropdownOpen(null);
          return;
        } else {
          update(ref(db, `meetings/${repetitiveMeetingId}/state`), {
            updatedAt: Date.now(),
          });
          refetchMeetingNotes();
          setDropdownOpen(null);
        }
      },
    });
  };

  // New function to handle note editing
  const handleEditNote = (note: RepeatMeetingNotesRes) => {
    if (note.noteId) {
      setEditingNoteId(note.noteId);
    }
    if (note.note) {
      setEditingNoteText(note.note);
    }
    setDropdownOpen(null); // Close dropdown when editing starts
  };

  // New function to submit the updated note
  const handleSubmitUpdate = (noteId: string) => {
    const payload = {
      repetitiveMeetingId,
      employeeId,
      note: editingNoteText,
      noteId: noteId,
    };

    addNote(payload, {
      onSuccess: async () => {
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
          update(ref(db, `meetings/${repetitiveMeetingId}/state`), {
            updatedAt: Date.now(),
          });
          refetchMeetingNotes();
          setEditingNoteId(null);
          setEditingNoteText("");
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
      employeeId,
      // title: titleInput,
      note: noteInput,
      repetitiveMeetingId: repetitiveMeetingId,
      createdAt: new Date().toISOString(),
    };

    addNote(payload);
  };

  return (
    <div className={cn("px-2", className)}>
      {meetingStatus !== "ENDED" && (
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
                    handleAddNote();
                  }
                }}
              />

              <div className="flex justify-end items-center mt-2">
                <button
                  onClick={handleAddNote}
                  className="text-sm text-gray-600 cursor-pointer flex flex-col z-50"
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
        className={`px-2 space-y-2 h-[calc(100vh-230px)] overflow-auto pb-2 overflow-y-auto ${className}`}
      >
        {Array.isArray(meetingNotes?.data) &&
          meetingNotes.data.map((note: RepeatMeetingNotesRes, idx: number) => {
            return (
              <div
                key={note.noteId || idx}
                className="flex items-start bg-white rounded-lg border px-3 py-2 shadow-sm gap-2"
              >
                <div className="flex-1 text-sm text-black">
                  <div className="flex justify-between items-center mb-1">
                    {/* <span className="font-medium text-xs text-gray-600">
                      {author?.employeeName || "Unknown"}
                    </span> */}
                    <div>
                      {note.noteType && (
                        <span className="text-xs text-gray-600 mr-2 bg-gray-200/80 p-0.5 rounded-full px-2">
                          {note.noteType}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
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
                    {/* Conditional rendering for editing mode */}
                    {editingNoteId === note.noteId ? (
                      <div className="flex-1 relative">
                        <textarea
                          className="w-full border border-gray-300 rounded px-2 py-1 text-black resize-none focus:outline-none focus:border-blue-500"
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          autoFocus
                          rows={2}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              if (note.noteId) {
                                handleSubmitUpdate(note.noteId);
                              }
                            } else if (e.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              handleSubmitUpdate(note.noteId!);
                            }}
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
                        <p className="break-words">{note.note}</p>
                        {meetingStatus !== "ENDED" && (
                          <div>
                            <DropdownMenu
                              open={dropdownOpen === note.noteId}
                              onOpenChange={(open) =>
                                setDropdownOpen(open ? note.noteId! : null)
                              }
                            >
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="text-gray-500 items-center text-sm w-fit py-1.5 px-2 cursor-pointer"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleDropdown(note.noteId!);
                                  }}
                                >
                                  <EllipsisVertical className="h-5 w-5" />
                                </button>
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
                                {!note.noteType && (
                                  <>
                                    {/* <DropdownMenuItem
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
                                    </DropdownMenuItem> */}
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
                                  </>
                                )}
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (note.noteId) {
                                      handleDelete(note.noteId);
                                    }
                                  }}
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50 px-2 py-1.5"
                                >
                                  <Unlink className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      {/* {drawerOpen && (
        <TaskDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          taskData={selectedTask as TaskGetPaging}
          tasksFireBase={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
      )}
      {drawerProj && (
        <ProjectDrawer
          open={drawerProj}
          onClose={() => setDrawerProj(false)}
          projectData={selectedProject as CompanyProjectDataProps}
          projectsFireBase={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
      )} */}
    </div>
  );
};

export default RepeatMeetingNotes;
