import React, { useMemo, useState } from "react";

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
import TaskDrawer from "../Tasks/taskDrawer";
import ProjectDrawer from "../Projects/projectDrawer";
import {
  addMeetingNotesMutation,
  deleteCompanyMeetingMutation,
  useGetMeetingNotes,
} from "@/features/api/detailMeeting";
import { get, getDatabase, ref, update } from "firebase/database";
import { queryClient } from "@/queryClient";
import { useSelector } from "react-redux";
import { getUserId } from "@/features/selectors/auth.selector";

interface MeetingNotesProps {
  joiners: Joiners[];
  employeeId: string;
  meetingId: string;
  className?: string;
  meetingName?: string;
  meetingStatus?: string;
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
}) => {
  const [noteInput, setNoteInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerProj, setDrawerProj] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskGetPaging | TaskData>();
  const [selectedProject, setSelectedProject] = useState<
    CompanyProjectDataProps | TaskData
  >();

  const userId = useSelector(getUserId);

  // New states for editing notes
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  const db = getDatabase();

  const meetingRef = ref(db, `meetings/${meetingId}`);

  const { data: meetingNotes, refetch: refetchMeetingNotes } =
    useGetMeetingNotes({
      filter: {
        meetingId: meetingId,
      },
      enable: !!meetingId,
    });
  const { mutate: addNote } = addMeetingNotesMutation();
  const deleteNoteMutation = deleteCompanyMeetingMutation();

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
          update(ref(db, `meetings/${meetingId}/state`), {
            updatedAt: Date.now(),
          });
        }
      },
    });
    setDropdownOpen(null); // Close dropdown after action
  };

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

  const handleMarkNotes = (data: MeetingNotesRes, type: string) => {
    const payload = {
      meetingId,
      employeeId,
      note: data.note,
      noteType: type.toUpperCase(),
      meetingNoteId: data.meetingNoteId,
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
          update(ref(db, `meetings/${meetingId}/state`), {
            updatedAt: Date.now(),
          });
          refetchMeetingNotes();
          setDropdownOpen(null);
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
          meetingNotes.data.map((note: MeetingNotesRes, idx: number) => {
            const author = joiners.find(
              (j) => j.employeeId === note.employeeId,
            );

            return (
              <div
                key={note.meetingNoteId || idx}
                className="flex items-start bg-white rounded-lg border px-3 py-2 shadow-sm gap-2"
              >
                <div className="flex-1 text-sm text-black">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-xs text-gray-600">
                      {author?.employeeName || "Unknown"}
                    </span>
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
                    {editingNoteId === note.meetingNoteId ? (
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
                        <p className="break-words">{note.note}</p>
                        {meetingStatus !== "ENDED" && (
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
                                  </>
                                )}
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
    </div>
  );
};

export default MeetingNotes;
